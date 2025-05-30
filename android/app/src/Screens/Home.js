import React, { useRef, useState ,useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { logAttendance } from '../../../../firebase/firebase';
import auth from '@react-native-firebase/auth'
import firestore  from '@react-native-firebase/firestore'
import { useFocusEffect } from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const daysToShow = 14;

const Home = () => {
  const today = new Date();

  const [checkInTime, setCheckInTime] = useState(null);
  const [breakInTime, setBreakInTime] = useState(null);
  const [breakOutTime, setBreakOutTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [breakDuration, setBreakDuration] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [workingDays,setWorkingDays]=useState(0)
  const [currentAction, setCurrentAction] = useState('checkIn');
  const currentActionRef = useRef('checkIn');
  const [actionCompleted, setActionCompleted] = useState(false);
  const breakInTimeRef = useRef(null);
  const [userData,setUserData]=useState({})

  const currentUser = auth().currentUser;
  const fetchWorkingDays = async () => {
  if (currentUser) {
    try {
      const snapshot = await firestore().collection('attendances').get();
      let presentCount = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.hasOwnProperty(currentUser.uid)) {
          presentCount++;
        }
      });
      setWorkingDays(presentCount);
    } catch (error) {
      Alert.alert('Error fetching working days', error.message);
    }
  }
};


  const fetchTodayAttendance = async () => {
  if (!currentUser) return;

  try {
    const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const docSnapshot = await firestore().collection('attendances').doc(dateKey).get();

    if (docSnapshot.exists) {
      const attendanceData = docSnapshot.data();
      if (!attendanceData) {
        console.warn("Attendance data is undefined or null.");
        return;
      }
      const userAttendance = attendanceData[currentUser.uid];

      if (userAttendance) {
        if (userAttendance.checkInTime) setCheckInTime(userAttendance.checkInTime.toDate());
        if (userAttendance.breakInTime) setBreakInTime(userAttendance.breakInTime.toDate());
        if (userAttendance.breakOutTime) {
          const outTime = userAttendance.breakOutTime.toDate();
          setBreakOutTime(outTime);

          const durationMs = outTime - new Date(userAttendance.breakInTime.toDate());
          setBreakDuration(`${Math.floor(durationMs / 60000)} min`);
        }
        if (userAttendance.checkOutTime) setCheckOutTime(userAttendance.checkOutTime.toDate());

        if (userAttendance.checkOutTime) {
          updateAction('checkIn');
        } else if (userAttendance.breakOutTime) {
          updateAction('checkOut');
        } else if (userAttendance.breakInTime) {
          updateAction('breakOut');
        } else if (userAttendance.checkInTime) {
          updateAction('breakIn');
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch today attendance', error);
  }
};

 useFocusEffect(
  React.useCallback(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          const doc = await firestore().collection('users').doc(currentUser.uid).get();
          if (doc.exists) {
            const data = doc.data();
            setUserData(data);
            await fetchWorkingDays(); 
            await fetchTodayAttendance(data.name);
          } else {
            Alert.alert("User not found");
          }
        } catch (error) {
          Alert.alert("Error", error.message);
        }
      }
    };

    fetchData();
  }, [currentUser])
);
 
  useEffect(() => {
    if (breakInTime && breakOutTime) {
      const durationMs = breakOutTime - breakInTime;
      const minutes = Math.floor(durationMs / 60000);
      setBreakDuration(`${minutes} min`);
    }
  }, [breakInTime, breakOutTime]);
  
  const pan = useRef(new Animated.ValueXY()).current;
  
  const updateAction = (newAction) => {
    setCurrentAction(newAction);
    currentActionRef.current = newAction;
  };
  useEffect(() => {
    if (checkOutTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diffInMs = now - checkOutTime;
        const diffInHours = diffInMs / (1000 * 60 * 60);
  
        if (diffInHours >= 1) {
          // Reset all states
          setCheckInTime(null);
          setBreakInTime(null);
          setBreakOutTime(null);
          setCheckOutTime(null);
          setBreakDuration(null);
          setCurrentAction('checkIn');
          currentActionRef.current = 'checkIn';
          setActivityLog([]);
          clearInterval(interval); // Clear the interval after reset
        }
      }, 60 * 1000); // Check every minute
  
      return () => clearInterval(interval);
    }
  }, [checkOutTime]);
  
  const handleSwipeAction = async () => {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDateTime = now.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (actionCompleted) return;

  const newWorkingDays = workingDays + 1;

  try {
    switch (currentActionRef.current) {
      case 'checkIn':
        setCheckInTime(now);
        updateAction('breakIn');
        setActivityLog((prev) => [{ type: 'Check In', time: timeString ,now: formattedDateTime}, ...prev]);
        await logAttendance({
          checkInTime: now,
          fullName: userData.name,
          // userName: userData.name,
          
        });
        Alert.alert('Checked In at', timeString);
        break;

      case 'breakIn':
        setBreakInTime(now);
        breakInTimeRef.current = now;
        updateAction('breakOut');
        setActivityLog((prev) => [{ type: 'Break In', time: timeString, now: formattedDateTime }, ...prev]);
        console.log('Logging attendance with:', {
  checkInTime: now,
  fullName: userData.name,
  userName: userData.name,
});

        await logAttendance({
          breakInTime: now,
          fullName: userData.name,
          // userName: userData.name,
        });
        Alert.alert('Break Started at', timeString);
        break;

      case 'breakOut':
        if (breakInTimeRef.current) {
          setBreakOutTime(now);
          updateAction('checkOut');
              const durationMs = now - breakInTimeRef.current;
              const minutes = Math.floor(durationMs / 60000);
              const durationString = `${minutes} min`;
              setBreakDuration(durationString);

          setActivityLog((prev) => [
            { type: 'Break Out', time: timeString, now: formattedDateTime },
            ...prev,
          ]);
            console.log('Logging attendance with:', {
  checkInTime: now,
  fullName: userData.name,
  userName: userData.name,
});

          await logAttendance({
            breakOutTime: now,
            breakDuration:durationString,
            fullName: userData.name,
          // userName: userData.name,
          });

          Alert.alert('Break Ended at', timeString);
        } else {
          Alert.alert('Error', 'No Break In Time found.');
        }
        break;

      case 'checkOut':
        setCheckOutTime(now);
        updateAction('checkIn');
        setActivityLog((prev) => [{ type: 'Check Out', time: timeString ,now: formattedDateTime}, ...prev]);
       console.log('Logging attendance with:', {
  checkInTime: now,
  fullName: userData.name,
  userName: userData.name,
});

        await logAttendance({
          checkOutTime: now,
          workingDays: newWorkingDays,
          fullName: userData.name,
          // userName: userData.name,
        });
         await fetchWorkingDays();
        Alert.alert('Checked Out at', timeString);
        break;
    }
  } catch (error) {
    console.error('Error logging attendance:', error);
    Alert.alert('Error', 'Failed to log attendance. Please try again.');
  }

  setActionCompleted(true);
  setTimeout(() => {
    setActionCompleted(false);
  }, 1000);
};

  

  const panResponder = useRef(null);

useEffect(() => {
  if (userData && userData.name) {
    panResponder.current = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dx > 5,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SCREEN_WIDTH * 0.5) {
          Animated.timing(pan.x, {
            toValue: SCREEN_WIDTH - 100,
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            handleSwipeAction();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    });
  }
}, [userData]);


  const dates = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return {
      key: i.toString(),
      date: date.getDate(),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: date.toDateString() === today.toDateString(),
    };
  });

  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, item.isToday && styles.todayHighlight]}>
      <Text style={[styles.dayText, item.isToday && styles.todayText]}>{item.day}</Text>
      <Text style={[styles.dateText, item.isToday && styles.todayText]}>{item.date}</Text>
    </View>
  );

  return (
    <View style={{  flex: 1 }}>
      <View style={{ flexDirection: 'row', margin: 20, alignItems: 'center' }}>
          <Image
  style={{ height: 60, width: 60, borderRadius: 30, borderWidth: 1, borderColor: 'black' }}
  source={userData?.imageUrl ? { uri: userData.imageUrl } : {uri:''}}
/>
        <View style={{ marginLeft: 10, width: 200 }}>
        <Text style={{ fontSize: 19 }}>{userData?.name || ''}</Text>
        <Text>{userData?.designation || ''}</Text>
        </View>
        <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, borderWidth: 0.1, justifyContent: 'center', alignItems: 'center' }}>
          <Image style={{ height: 20, width: 20 }} source={{ uri: 'https://cdn-icons-png.flaticon.com/128/2645/2645897.png' }} />
        </TouchableOpacity>
      </View>
      <View>
        
      <FlatList
        data={dates}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
      </View>

      <Text style={{ margin: 20, fontSize: 15 }}>Today Attendance</Text>

      <View>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <View style={styles.iconBox}>
                <Image style={styles.icon} source={{ uri: 'https://cdn-icons-png.flaticon.com/128/906/906801.png' }} />
              </View>
              <Text style={{ fontSize: 16 }}>Check In</Text>
            </View>
            <Text style={{ fontSize: 20, marginTop: 10 }}>
              {checkInTime ? new Date(checkInTime).toLocaleTimeString() : '--:--'}
            </Text>
            <Text style={{ fontSize: 16 }}>{checkInTime ? 'On Time' : 'Pending'}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.iconRow}>
              <View style={styles.iconBox}>
                <Image style={styles.icon} source={{ uri: 'https://cdn-icons-png.flaticon.com/128/992/992680.png' }} />
              </View>
              <Text style={{ fontSize: 16 }}>Check Out</Text>
            </View>
            <Text style={{ fontSize: 20, marginTop: 10 }}>
              {checkOutTime ? new Date(checkOutTime).toLocaleTimeString() : '--:--'}
            </Text>
            <Text style={{ fontSize: 16 }}>{checkOutTime ? 'Completed' : 'Pending'}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <View style={styles.iconBox}>
                <Image style={styles.icon} source={{ uri: 'https://cdn-icons-png.flaticon.com/128/906/906801.png' }} />
              </View>
              <Text style={{ fontSize: 16 }}>Break Time</Text>
            </View>
            <Text style={{ fontSize: 20, marginTop: 10 }}>
            {breakInTime && breakOutTime && breakDuration ? breakDuration : '--:--'}

            </Text>
            <Text style={{ fontSize: 16 }}>Avg time 60</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.iconRow}>
              <View style={styles.iconBox}>
                <Image style={styles.icon} source={{ uri: 'https://cdn-icons-png.flaticon.com/128/992/992680.png' }} />
              </View>
              <Text style={{ fontSize: 16 }}>Total Days</Text>
            </View>
            <Text style={{ fontSize: 20, marginTop: 10 }}>{workingDays}</Text>
            <Text style={{ fontSize: 16 }}>Working days</Text>
          </View>
        </View>
      </View>

      {/* Your Activity Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginHorizontal: 20 }}>
        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>Your Activity</Text>
        <TouchableOpacity>
          <Text style={{ color: 'skyblue' }}>View All</Text>
        </TouchableOpacity>
      </View>

      {activityLog.length > 0 && (
        <View style={{ marginHorizontal: 20, marginTop: 10,height:105 }}>
        {activityLog.map((log, index) => {
  let iconUri;

  switch (log.type) {
    case 'Check In':
      iconUri = 'https://cdn-icons-png.flaticon.com/128/906/906801.png';
      break;
    case 'Check Out':
      iconUri = 'https://cdn-icons-png.flaticon.com/128/992/992680.png';
      break;
    case 'Break In':
      iconUri = 'https://cdn-icons-png.flaticon.com/128/751/751621.png'; 
      break;
    case 'Break Out':
      iconUri = 'https://cdn-icons-png.flaticon.com/128/751/751621.png'; 
      break;
    default:
      iconUri = '';
  }

  return (
    <View key={index} style={{ padding: 15, backgroundColor: 'white', marginBottom: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Image source={{ uri: iconUri }} style={{ width: 20, height: 20, marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15 }}>{log.type}</Text>
        <Text style={{ fontSize: 10 }}>{log.now}</Text>
      </View>
      <View>
        <Text style={{ fontSize: 15 }}>{log.time}</Text>
        <Text style={{ fontSize: 10 }}>on Time</Text>
      </View>
    </View>
  );
})}

        </View>
      )}

      {/* Swipe Button */}
      <View>
        {!checkOutTime && (
          <View style={styles.swipeWrapper}>
            <View style={[
    styles.swipeContainer,
    {
      backgroundColor:
        currentActionRef.current === 'checkIn'
          ? 'skyblue'
          : currentActionRef.current === 'checkOut'
          ? 'red'
          : currentActionRef.current === 'breakIn'
          ? 'yellow'
          : 'yellow',
    },
  ]}>
              <Text style={styles.swipeText}>
                {!checkInTime
                  ? 'Swipe to Check In'
                  : !breakInTime
                  ? 'Swipe to Break In'
                  : !breakOutTime
                  ? 'Swipe to Break Out'
                  : 'Swipe to Check Out'}
              </Text>
              {panResponder.current && (
  <Animated.View
    {...panResponder.current.panHandlers}
    style={[styles.swipeButton, { transform: [{ translateX: pan.x }] }]}
  >
    <Text style={styles.arrow}>{'>'}</Text>
  </Animated.View>
)}

            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    width: 60,
    height: 80,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayHighlight: {
    backgroundColor: '#3399ff',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  todayText: {
    color: 'white',
  },
  card: {
    height: 120,
    width: 150,
    borderRadius: 10,
    borderWidth: 0.3,
    marginLeft: 20,
    padding: 15,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBox: {
    height: 25,
    width: 25,
    backgroundColor: 'skyblue',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    height: 15,
    width: 15,
  },
  swipeWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  swipeContainer: {
    width: '90%',
    height: 60,
  
    borderRadius: 10,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  swipeText: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 16,
    color: '#555',
  },
  swipeButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007bff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: 'white',
    fontSize: 22,
  },
});

export default Home;
