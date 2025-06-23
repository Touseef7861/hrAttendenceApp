import React from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import moment from 'moment';

const PDFShare = ({ selectedMonth, getAttendanceForDate, getLeaveForDate, getStatusForDate, setShowMenu }) => {

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
      <h1 style="text-align: center;">Attendance Data - ${selectedMonth.format('MMMM YYYY')}</h1>
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
      const pdfPath = await generatePDF();

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
          Alert.alert('Permission Denied', 'Storage permission denied');
          return;
        }
      }

      const fileName = `attendance_${selectedMonth.format('YYYY_MM')}.pdf`;
      const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      await RNFS.copyFile(pdfPath, destPath);

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
      Alert.alert('Error', 'Failed to save PDF');
    }

    setShowMenu(false);
  };

  const handleShare = async () => {
    try {
      const path = await generatePDF();
      const shareOptions = {
        title: 'Attendance Report',
        message: 'Here is the attendance report',
        url: `file://${path}`,
        type: 'application/pdf',
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error sharing PDF:', error);
      Alert.alert('Error', 'Failed to share PDF');
    }

    setShowMenu(false);
  };

  return { handleDownload, handleShare };
};

export default PDFShare;