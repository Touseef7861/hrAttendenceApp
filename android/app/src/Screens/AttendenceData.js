import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,PermissionsAndroid, Platform 
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Feather';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { downloadFile } from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';

const AttendanceData = ({ route, navigation }) => {
  const { uid } = route.params;
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(moment());
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchMonthData(selectedMonth);
  }, []);

  const fetchMonthData = async (monthMoment) => {
    setLoading(true);
    const start = monthMoment.clone().startOf('month');
    const end = monthMoment.clone().endOf('month');
    const dates = [];
    for (let m = start.clone(); m.isSameOrBefore(end); m.add(1, 'day')) {
      dates.push(m.format('YYYY-MM-DD'));
    }

    // Fetch all attendance docs for the month (assuming doc per date)
    const data = [];
    for (const date of dates) {
      const doc = await firestore().collection('attendances').doc(date).get();
      if (doc.exists && doc.data()?.[uid]) {
        data.push({ uid, date, ...doc.data()[uid] });
      }
    }

    await fetchLeaves(uid);
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
    console.log('leaveDocs',leaveDocs)
  };

  // Check if date is in leave range (approved leave)
 const getLeaveForDate = (date) => {
  return leaveData.find(
    (leave) =>
      moment(date, 'YYYY-MM-DD').isSameOrAfter(moment(leave.startDate, 'M/D/YYYY')) &&
      moment(date, 'YYYY-MM-DD').isSameOrBefore(moment(leave.endDate, 'M/D/YYYY'))
  );
};


  // Get attendance record for the date
  const getAttendanceForDate = (date) => {
    return attendanceData.find((att) => att.date === date);
  };

  // Determine the day label/status for the row
  const getStatusForDate = (date) => {
    const dayName = moment(date).format('dddd');
    if (dayName === 'Saturday' || dayName === 'Sunday') return 'Off';

    const leave = getLeaveForDate(date);
    if (leave) return 'Leave';

    const attendance = getAttendanceForDate(date);
    if (attendance) return 'Present';

    return 'Absent';
  };

  const generatePDF = async () => {
    const start = selectedMonth.clone().startOf('month');
    const end = selectedMonth.clone().endOf('month');
    const dates = [];
    for (let m = start.clone(); m.isSameOrBefore(end); m.add(1, 'day')) {
      dates.push(m.format('YYYY-MM-DD'));
    }

    const tableRows = dates.map((date, index) => {
      const leave = getLeaveForDate(date);
      const attendance = getAttendanceForDate(date);
      const status = getStatusForDate(date);

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${moment(date).format('DD MMM YYYY')}</td>
          <td>${moment(date).format('dddd')}</td>
          <td>${attendance?.checkInTime ? moment(attendance.checkInTime.toDate()).format('hh:mm A') : '-'}</td>
          <td>${attendance?.breakInTime ? moment(attendance.breakInTime.toDate()).format('hh:mm A') : '-'}</td>
          <td>${attendance?.breakOutTime ? moment(attendance.breakOutTime.toDate()).format('hh:mm A') : '-'}</td>
          <td>${attendance?.checkOutTime ? moment(attendance.checkOutTime.toDate()).format('hh:mm A') : '-'}</td>
          <td>${attendance?.workingDays || '-'}</td>
          <td>${status}</td>
        </tr>
      `;
    });

    const html = `
      <h1 style="text-align: center;">Attendance Data - ${selectedMonth.format(
        'MMMM YYYY'
      )}</h1>
      <table border="1" style="width: 100%; border-collapse: collapse; text-align: center;">
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Day</th>
          <th>Check In</th>
          <th>Break In</th>
          <th>Break Out</th>
          <th>Check Out</th>
          <th>Working Days</th>
          <th>Status</th>
        </tr>
        ${tableRows.join('')}
      </table>
    `;

    const options = {
      html,
      fileName: `attendance_report_${selectedMonth.format('YYYY_MM')}`,
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  };

  const handleDownload = async () => {
  try {
    const pdfPath = await generatePDF(); // This creates and returns file path like /storage/emulated/0/Documents/...

    // For Android: Request write permission if not granted
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to download the file',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        alert('Storage permission denied');
        return;
      }
    }

    const fileName = `attendance_${selectedMonth.format('YYYY_MM')}.pdf`;
    const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    await RNFS.copyFile(pdfPath, destPath);

    // Trigger Android DownloadManager to notify user
    RNFetchBlob.android.addCompleteDownload({
      title: fileName,
      description: 'Attendance Report PDF',
      mime: 'application/pdf',
      path: destPath,
      showNotification: true,
      notification: true,
      mediaScannable: true,
    });

  } catch (error) {
    console.error('Error saving PDF to Downloads:', error);
    alert('Failed to save PDF');
  }

  setShowMenu(false);
};

 const handleShare = async () => {
  try {
    const path = await generatePDF(); // This returns the file path
    const shareOptions = {
      title: 'Attendance Report',
      message: 'Here is the attendance report',
      url: `file://${path}`,
      type: 'application/pdf',
    };

    await Share.open(shareOptions);
  } catch (error) {
    console.error('Error sharing PDF:', error);
    alert('Failed to share PDF');
  }

  setShowMenu(false);   
};

  const renderItem = ({ item, index }) => {
    const status = getStatusForDate(item.date);
    return (
      
        <View style={{ flexDirection: 'row', padding: 10, borderBottomWidth: 1 }}>
          <Text style={{ width: 30 }}>{index + 1}</Text>
          <Text style={{ width: 100 }}>{moment(item.date).format('DD MMM YYYY')}</Text>
          <Text style={{ width: 100 }}>{moment(item.date).format('dddd')}</Text>
          <Text style={{ width: 80 }}>
            {item.checkInTime ? moment(item.checkInTime.toDate()).format('hh:mm A') : '-'}
          </Text>
          <Text style={{ width: 80 }}>
            {item.breakInTime ? moment(item.breakInTime.toDate()).format('hh:mm A') : '-'}
          </Text>
          <Text style={{ width: 80 }}>
            {item.breakOutTime ? moment(item.breakOutTime.toDate()).format('hh:mm A') : '-'}
          </Text>
          <Text style={{ width: 80 }}>
            {item.checkOutTime ? moment(item.checkOutTime.toDate()).format('hh:mm A') : '-'}
          </Text>
          <Text style={{ width: 60 }}>{item.workingDays|| '-'}</Text>
          <Text style={{ width: 60 }}>{status}</Text>
        </View>
      
    );
  };

  // To render full month with all dates (even if no attendance record),
  // build a data source array with all dates and their attendance or status.
  const fullMonthData = () => {
  const start = selectedMonth.clone().startOf('month');
  const today = moment(); // today's date
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

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: 10,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={{ height: 25, width: 25 }}
            source={{ uri: 'https://cdn-icons-png.flaticon.com/128/130/130882.png' }}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 18 }}>Attendance Data</Text>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Icon name="more-vertical" size={24} />
        </TouchableOpacity>
      </View>

      {/* Table Header */}
      {/* Horizontal Scroll Container for header and list rows together */}
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <View>
    {/* Table Header */}
    <View
      style={{
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#eee',
        borderBottomWidth: 1,
      }}
    >
      <Text style={{ width: 30 }}>#</Text>
      <Text style={{ width: 100 }}>Date</Text>
      <Text style={{ width: 100 }}>Day</Text>
      <Text style={{ width: 80 }}>Check In</Text>
      <Text style={{ width: 80 }}>Break In</Text>
      <Text style={{ width: 80 }}>Break Out</Text>
      <Text style={{ width: 80 }}>Check Out</Text>
      <Text style={{ width: 80 }}>Working Days</Text>
      <Text style={{ width: 60 }}>Status</Text>
    </View>

    {/* Table Rows (Vertically Scrollable) */}
    
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
    {loading ? (
      <View style={{ flex: 1,marginRight:350,justifyContent:'center' }}>
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

  </View>
</ScrollView>



      {/* Month Picker Modal */}
      <Modal visible={showMonthPicker} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
              width: 300,
            }}
          >
            <Text style={{ textAlign: 'center', fontSize: 18, marginBottom: 15 }}>
              {selectedMonth.format('MMMM YYYY')}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity onPress={() => handleMonthChange(-1)}>
                <Text style={{ fontSize: 16 }}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMonthChange(1)}>
                <Text style={{ fontSize: 16 }}>Next</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                fetchMonthData(selectedMonth);
                setShowMonthPicker(false);
              }}
              style={{ marginTop: 20, backgroundColor: '#007bff', padding: 10, borderRadius: 5 }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowMonthPicker(false);
              }}
              style={{ marginTop: 20, backgroundColor: '#007bff', padding: 10, borderRadius: 5 }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom 3-dot menu modal */}
      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
        >
          <View
            style={{
              position: 'absolute',
              top: 50,
              right: 15,
              backgroundColor: 'white',
              padding: 10,
              borderRadius: 8,
              elevation: 5,
              shadowColor: '#000',
            }}
          >
            <TouchableOpacity onPress={handleDownload} style={{ paddingVertical: 8 }}>
              <Text>Download PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={{ paddingVertical: 8 }}>
              <Text>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                setShowMonthPicker(true);
              }}
              style={{ paddingVertical: 8 }}
            >
              <Text>History</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default AttendanceData;
