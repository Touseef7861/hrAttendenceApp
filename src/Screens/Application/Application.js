import React, { useState, useEffect } from "react";
import { Image, Text, View, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from "../../ThemeContext";
import AppText from "../../Components/AppText";

const Application = () => {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [isModal, setModal] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [isHR, setIsHR] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
const [filterApproved, setFilterApproved] = useState(false);
const [filterPending, setFilterPending] = useState(false);
const [filterRejected, setFilterRejected] = useState(false);
const [filtersApplied, setFiltersApplied] = useState(false);
const [selectedName, setSelectedName] = useState('All'); 
const [teamMembers, setTeamMembers] = useState([]);
const {theme} = useTheme()

useEffect(() => {
  const fetchTeamMembers = async () => {
    try {
      const queryUsers = await firestore().collection('users').get()
      const members = queryUsers.docs.map(doc => ({
        uid: doc.id,
        name: doc.data().name,
      }));
      setTeamMembers([{ name: 'All', uid: 'All' }, ...members]);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  fetchTeamMembers();
}, []);

  const [stats, setStats] = useState({
  balance: 0,
  approved: 0,
  pending: 0,
  cancelled: 0
});
  const[balance1,setBalance1]=useState(0)
  const currentUser = auth().currentUser;
  const email = currentUser?.email;
  const uid = currentUser?.uid;

  useEffect(() => {
  if (email === 'hr1@gmail.com') {
    setIsHR(true);
  }
}, [email]);

useEffect(() => {
  fetchLeaves();
}, [isHR]);

const CustomCheckbox = ({ label, onChange, checked }) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        padding: 10,
        borderRadius: 8,
      }}
      onPress={() => onChange(!checked)}
    >
      <Text style={{ fontSize: 20, color: checked ? 'dodgerblue' : 'gray' }}>
        {checked ? '☑️' : '☐'}
      </Text>
      <Text style={{ marginLeft: 12, fontSize: 16 }}>{label}</Text>
    </TouchableOpacity>
  );
};

  const fetchLeaves = async () => {
  try {
    const isCurrentHR = email === 'hr1@gmail.com';

    let allLeaves = [];

    if (isCurrentHR) {
      const usersSnapshot = await firestore().collection('leaves').get();

      const userLeavesPromises = usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;

        const userLeavesSnapshot = await firestore()
          .collection('leaves')
          .doc(userId)
          .collection('userLeaves')
          .get();

        return userLeavesSnapshot.docs.map(doc => ({
          id: doc.id,
          userId,
          ...doc.data(),
        }));
      });

      const allUserLeavesNested = await Promise.all(userLeavesPromises);
      allLeaves = allUserLeavesNested.flat();
    } else {
      const snapshot = await firestore()
        .collection('leaves')
        .doc(uid)
        .collection('userLeaves')
        .get();

      allLeaves = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    }
    setLeaves(allLeaves);

    const approved = allLeaves.filter(l => l.status === 'Approved').length;
    const pending = allLeaves.filter(l => l.status === 'Pending').length;
    const cancelled = allLeaves.filter(l => l.status === 'Rejected').length;
    const balance = allLeaves.length;
    const balance1 = allLeaves.filter(leave => leave.email === email).length;
    setBalance1(balance1)
    setStats({ balance, approved, pending, cancelled });
  } catch (error) {
    console.error('Error fetching leaves:', error);
  }
};


  const handleApply = () => {
    setModalVisible(true);
    fetchLeaves();
  };

  const showModal=()=>{
    setModal(true)
  }

  const updateStatus = async (targetUid, leaveId, status) => {
    console.log("targetUid,leaveId,status",targetUid, leaveId, status)
    try {
      await firestore()
        .collection('leaves')
        .doc(targetUid)
        .collection('userLeaves')
        .doc(leaveId)
        .update({ status });

      fetchLeaves();
    } catch (error) {
      console.error('Error updating leave status:', error);
    }
  };

const filteredLeaves = () => {
  let data = [];

  if (selectedTab === 'upcoming') {
    data = isHR
      ? leaves.filter(l => l.status === 'Approved')
      : leaves.filter(l => l.email === email && l.status === 'Approved');
  } else if (selectedTab === 'post') {
    data = isHR
      ? leaves.filter(l => ['Pending', 'Rejected'].includes(l.status))
      : leaves.filter(l => l.email === email);
  } else if (selectedTab === 'team') {
    data = leaves.filter(l => l.status === 'Pending');
  }

  // Filter by name if selected
  if (selectedName !== 'All') {
    data = data.filter(l => l.name === selectedName);
  }

  // If no filters are applied, return all
  if (!filtersApplied || (!filterApproved && !filterPending && !filterRejected)) {
    return data;
  }

  // Filter by selected statuses
  return data.filter(leave =>
    (filterApproved && leave.status === 'Approved') ||
    (filterPending && leave.status === 'Pending') ||
    (filterRejected && leave.status === 'Rejected')
  );
};




  const renderLeave = ({ item, index }) => {
  const calculateDays = (startDate, endDate) => {
  try {
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    // Split MM/DD/YYYY format
    const [startMonth, startDay, startYear] = startDate.split('/');
    const [endMonth, endDay, endYear] = endDate.split('/');

    const startDateObj = new Date(`${startYear}-${startMonth}-${startDay}`);
    const endDateObj = new Date(`${endYear}-${endMonth}-${endDay}`);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      console.error('Invalid date parsing');
      return 'Invalid Date';
    }

    const msInDay = 1000 * 60 * 60 * 24;
    const diffTime = endDateObj.getTime() - startDateObj.getTime();
    const diffDays = Math.ceil(diffTime / msInDay) + 1;

    return `${diffDays} Days`;
  } catch (error) {
    console.error('Error in date calculation:', error);
    return 'Error';
  }
};




  return (
    <View style={{ padding: 12 }}>
      {(selectedTab === 'upcoming' || selectedTab === 'post') && (
        <View style={{ height: 150, width: '95%', marginHorizontal: 10, backgroundColor: 'white', borderRadius: 10, padding: 15 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ opacity: 0.5 }}>Date</Text>
            <Text>{item.status}</Text>
          </View>
          <Text style={{ fontSize: 15 }}>
            {item.startDate}/{item.endDate}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <Text style={{ opacity: 0.5 }}>Apply Days</Text>
            <Text style={{ opacity: 0.5 }}>Leave Balance</Text>
            <Text style={{ opacity: 0.5 }}>Approved by</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Text>{calculateDays(item.startDate, item.endDate)}</Text>
            <Text>{balance1}</Text>
            <Text>Waheed</Text>
          </View>
        </View>
      )}

      {selectedTab === 'team' && (
        <View style={{ width: '95%', marginHorizontal: 10, backgroundColor: 'white', borderRadius: 10, padding: 15 }}>
          <TouchableOpacity style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}
          onPress={()=>navigation.navigate('LeaveDetails', { data: item })}
          >
            <Image
              style={{ height: 50, width: 50, backgroundColor: 'gray', borderRadius: 25,resizeMode:'cover' }}
              source={{ uri: item.image }}/>
            <View>
              <Text>{item.name}</Text>
              <Text>{item.startDate} - {item.endDate}</Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
            {selectedTab === 'team' && isHR && (
              <View style={{ flexDirection: 'row', gap: 30 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'skyblue',
                    height: 50,
                    width: 130,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    console.log('uid,id', item.userId, item.id);
                    updateStatus(item.userId, item.id, 'Approved');
                  }}
                >
                  <Text style={{ color: 'white' }}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'red',
                    height: 50,
                    width: 130,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => updateStatus(item.userId, item.id, 'Rejected')}
                >
                  <Text style={{ color: 'white' }}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};


  return (
    <View style={{ flex: 1,backgroundColor:theme.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', margin: 20, alignItems: 'center' }}>
        <AppText style={{ fontSize: 20 }}>All Leaves</AppText>
        <TouchableOpacity
          style={{ marginLeft: 150 }}
          onPress={() => navigation.navigate('LeaveForm', { onApply: handleApply })}
        >
          <Image style={{ height: 25, width: 25,tintColor:theme.text }} source={{ uri: 'https://cdn-icons-png.flaticon.com/128/3161/3161837.png' }} />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 20 }} onPress={()=>showModal()}>
          <Image style={{ height: 25, width: 25,tintColor: theme.text }} source={{ uri: 'https://cdn-icons-png.flaticon.com/128/8017/8017777.png' }} />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <View style={[styles.card,{borderColor:'skyblue'}]}><AppText style={styles.title}>Leave Balance</AppText><AppText style={[styles.value,{color:'skyblue'}]}>{stats.balance}</AppText></View>
          <View style={[styles.card,{borderColor:"orange"}]}><AppText style={styles.title}>Approved</AppText><AppText style={[styles.value,{color:'orange'}]}>{stats.approved}</AppText></View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={[styles.card,{borderColor:'skyblue'}]}><AppText style={styles.title}>Pending</AppText><AppText style={[styles.value,{color:'skyblue'}]}>{stats.pending}</AppText></View>
          <View style={[styles.card,{borderColor:'red'}]}><AppText style={styles.title}>Cancelled</AppText><AppText style={[styles.value,{color:'red'}]}>{stats.cancelled}</AppText></View>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row',  marginVertical: 15 }}>
        {['upcoming', 'post', 'team'].map(tab => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)} style={{backgroundColor: selectedTab === tab ? 'skyblue' : 'transparent',height:50,width:120,justifyContent:'center',alignItems:'center',borderRadius:10}}>
            <AppText style={{ fontSize: 16, fontWeight: selectedTab === tab ? 'bold' : 'normal' }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leave List */}
      <FlatList
        data={filteredLeaves()}
        keyExtractor={item => item.id}
        renderItem={renderLeave}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No leaves found.</Text>}
      />

      <Modal
        transparent
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={{ height: '50%', backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, alignItems: 'center' }}>
            <Image style={{height:100,width:100}} source={{uri:'https://cdn2.iconfinder.com/data/icons/medicare/512/ok_select_yes_apply_accept_approve_confirm-512.png'}}/>
            <Text style={{ fontSize: 20, marginTop: 20 }}>Leave Applied</Text>
            <Text style={{ fontSize: 20, marginBottom: 5 }}>Successfully</Text>
            <Text style={{ fontSize: 15,  }}>Your Leave has been</Text>
            <Text style={{ fontSize: 15, marginBottom: 20 }}>applied Successfully</Text>
            <TouchableOpacity
              style={{ backgroundColor: '#2196F3', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5,width:'90%',alignItems:'center' }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
  transparent
  visible={isModal}
  animationType="slide"
  onRequestClose={() => setModal(false)}
>
  <View style={{ flex: 1, justifyContent: 'flex-end' }}>
    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Filter</Text>
        <TouchableOpacity onPress={() => setModal(false)}>
          <Image style={{ height: 20, width: 20 }} source={{ uri: 'https://cdn-icons-png.flaticon.com/128/2734/2734822.png' }} />
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 20 }}>
        <CustomCheckbox label="Approved" checked={filterApproved} onChange={setFilterApproved} />
        <CustomCheckbox label="Pending" checked={filterPending} onChange={setFilterPending} />
        <CustomCheckbox label="Rejected" checked={filterRejected} onChange={setFilterRejected} />

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Filter by Name:</Text>
          <Picker
            selectedValue={selectedName}
            onValueChange={(itemValue) => setSelectedName(itemValue)}
            style={{ height: 50, width: '100%' }}
          >
            {teamMembers.map(member => (
              <Picker.Item key={member.uid} label={member.name} value={member.name} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          onPress={() => {
            setFiltersApplied(true);
            setModal(false);
          }}
          style={{
            marginTop: 20,
            backgroundColor: 'dodgerblue',
            padding: 12,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>Apply</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setFilterApproved(false);
            setFilterPending(false);
            setFilterRejected(false);
            setFiltersApplied(false);
            setSelectedName('All');
            setModal(false);
          }}
          style={{
            marginTop: 10,
            backgroundColor: 'gray',
            padding: 12,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>



    </View>
  );
};

const styles = {
  card: {
    height: 120,
    width: 150,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 20,
    padding: 15,
  },
  title: {
    fontSize: 18,
  },
  value: {
    fontSize: 17,
    marginTop: 10,
  }
};

export default Application;
