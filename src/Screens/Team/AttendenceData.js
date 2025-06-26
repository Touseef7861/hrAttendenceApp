import React, { useEffect, useState } from 'react';
import { View,Text,FlatList,TouchableOpacity,Modal,Image,ScrollView,ActivityIndicator} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import PDFShare from './PDFShare';
import Holiday from '../Holiday';

const AttendanceData = ({ route, navigation }) => {
  const { uid ,isHR=false} = route.params;
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(moment());
  const [showMenu, setShowMenu] = useState(false);
  const [holidaysfetch, setHolidaysfetch]=useState([]);

  useEffect(() => {
    fetchMonthData(selectedMonth);
  }, []);

  const fetchMonthData = async (monthMoment) => {
    setLoading(true);
    const start = monthMoment.clone().startOf('month');
    const end = monthMoment.clone().endOf('month');
    const snapshot = await firestore().collection('attendances')
      .where(firestore.FieldPath.documentId(), '>=', start.format('YYYY-MM-DD'))
      .where(firestore.FieldPath.documentId(), '<=', end.format('YYYY-MM-DD'))
      .get();

    const data = [];
    snapshot.forEach(doc => {
      const attendanceByUid = doc.data();
      if (attendanceByUid[uid]) {
        data.push({ uid, date: doc.id, ...attendanceByUid[uid] });
      }
    });

    await fetchLeaves(uid);
    await fetchHolidays();
    setAttendanceData(data);
    setLoading(false);
  };

  const fetchLeaves = async (uid) => {
    const leaveSnapshot = await firestore()
      .collection('leaves')
      .doc(uid)
      .collection('userLeaves')
      .where('userId', '==', uid)
      .where('status', '==', 'Approved')
      .get();

    const leaveDocs = leaveSnapshot.docs.map((doc) => doc.data());
    setLeaveData(leaveDocs);
  };

  const fetchHolidays = async () => {
  try {
    const snapshot = await firestore()
      .collection('holidays')
      .get();

    const holidaysDocs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setHolidaysfetch(holidaysDocs);
  } catch (error) {
    console.error('Error fetching holidays:', error);
  }
};

  const getLeaveForDate = (date) => {
    return leaveData.find(
      (leave) =>
        moment(date, 'YYYY-MM-DD').isSameOrAfter(moment(leave.startDate, 'M/D/YYYY')) &&
        moment(date, 'YYYY-MM-DD').isSameOrBefore(moment(leave.endDate, 'M/D/YYYY'))
    );
  };
const getHolidayForDate = (date) => {
  return holidaysfetch.find(
    (holiday) =>
      moment(date, 'YYYY-MM-DD').isSameOrAfter(moment(holiday.startDate)) &&
      moment(date, 'YYYY-MM-DD').isSameOrBefore(moment(holiday.endDate))
  );
};

  const getAttendanceForDate = (date) => {
    return attendanceData.find((att) => att.date === date);
  };

  const getStatusForDate = (date) => {
    const dayName = moment(date).format('dddd');
    if (dayName === 'Saturday' || dayName === 'Sunday') return 'Off';

    const leave = getLeaveForDate(date);
    if (leave) return 'Leave';

    const attendance = getAttendanceForDate(date);
    if (attendance) return 'Present';

    const holiday = getHolidayForDate(date)
    if(holiday) return 'Holiday';

    return 'Absent';
  };

  const renderItem = ({ item, index }) => {
    const status = getStatusForDate(item.date);
    return (
      <View style={{ flexDirection: 'row', padding: 10, borderBottomWidth: 1 }}>
        <Text style={{ width: 30 }}>{index + 1}</Text>
        <Text style={{ width: 100 }}>{moment(item.date).format('DD MMM YYYY')}</Text>
        <Text style={{ width: 100 }}>{moment(item.date).format('dddd')}</Text>
        <Text style={{ width: 80 }}>{item.checkInTime ? moment(item.checkInTime.toDate()).format('hh:mm A') : '-'}</Text>
        <Text style={{ width: 80 }}>{item.breakInTime ? moment(item.breakInTime.toDate()).format('hh:mm A') : '-'}</Text>
        <Text style={{ width: 80 }}>{item.breakOutTime ? moment(item.breakOutTime.toDate()).format('hh:mm A') : '-'}</Text>
        <Text style={{ width: 80 }}>{item.checkOutTime ? moment(item.checkOutTime.toDate()).format('hh:mm A') : '-'}</Text>
        <Text style={{ width: 60 }}>{status}</Text>
      </View>
    );
  };

  const fullMonthData = () => {
    const start = selectedMonth.clone().startOf('month');
    const today = moment();
    const dates = [];
    for (let m = start.clone(); m.isSameOrBefore(today, 'day'); m.add(1, 'day')) {
      const dateStr = m.format('YYYY-MM-DD');
      const attendance = getAttendanceForDate(dateStr);
      dates.push(attendance || { date: dateStr });
    }
    return dates;
  };

  const handleMonthChange = (direction) => {
    const newMonth = moment(selectedMonth).add(direction, 'months');
    setSelectedMonth(newMonth);
    fetchMonthData(newMonth);
  };
  const { handleDownload, handleShare } = PDFShare({
    selectedMonth,
    getAttendanceForDate,
    getLeaveForDate,
    getStatusForDate,
    setShowMenu,
  });
  return (
  <View style={{ flex: 1, backgroundColor: '#fff' }}>

    {/* Header */}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 10 }}>
      {isHR ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={{ height: 25, width: 25 }}
            source={{ uri: 'https://cdn-icons-png.flaticon.com/128/130/130882.png' }}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 25 }} />
      )}

      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Attendance Data</Text>

      <TouchableOpacity onPress={() => setShowMenu(true)}>
        <Image
          style={{ height: 20, width: 20 }}
          source={{ uri: 'https://cdn-icons-png.flaticon.com/128/2311/2311524.png' }}
        />
      </TouchableOpacity>
    </View>

    {/* Attendance Table */}
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#eee', borderBottomWidth: 1 }}>
          <Text style={{ width: 30 }}>#</Text>
          <Text style={{ width: 100 }}>Date</Text>
          <Text style={{ width: 100 }}>Day</Text>
          <Text style={{ width: 80 }}>Check In</Text>
          <Text style={{ width: 80 }}>Break In</Text>
          <Text style={{ width: 80 }}>Break Out</Text>
          <Text style={{ width: 80 }}>Check Out</Text>
          <Text style={{ width: 60 }}>Status</Text>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', margin: 50 }}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        ) : (
          <FlatList
            data={fullMonthData()}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScrollView>

    {/* Month Picker Modal */}
    <Modal visible={showMonthPicker} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, width: 300 }}>
          <Text style={{ textAlign: 'center', fontSize: 18, marginBottom: 15 }}>{selectedMonth.format('MMMM YYYY')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity onPress={() => handleMonthChange(-1)}><Text style={{ fontSize: 16 }}>Previous</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleMonthChange(1)}><Text style={{ fontSize: 16 }}>Next</Text></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => { fetchMonthData(selectedMonth); setShowMonthPicker(false); }} style={{ marginTop: 20, backgroundColor: '#007bff', padding: 10, borderRadius: 5 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Apply</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMonthPicker(false)} style={{ marginTop: 10, backgroundColor: '#007bff', padding: 10, borderRadius: 5 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {/* Options Menu Modal */}
    <Modal visible={showMenu} transparent animationType="fade">
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setShowMenu(false)} activeOpacity={1}>
        <View style={{ position: 'absolute', top: 50, right: 15, backgroundColor: 'white', padding: 10, borderRadius: 8, elevation: 5 }}>
          <TouchableOpacity onPress={handleDownload} style={{ paddingVertical: 8 }}>
            <Text>Download PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={{ paddingVertical: 8 }}>
            <Text>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowMenu(false); setShowMonthPicker(true); }} style={{ paddingVertical: 8 }}>
            <Text>History</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>

  </View>
);

};

export default AttendanceData;