import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

export const logAttendance = async ({
  checkInTime,
  breakInTime,
  breakOutTime,
  breakDuration,
  checkOutTime,
  fullName,
  userName,
}) => {
  try {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      throw new Error('User not logged in');
    }

    const uid = currentUser.uid;
    const today = new Date().toISOString().split('T')[0];

    const attendanceEntry = {
      lastUpdated: firestore.FieldValue.serverTimestamp(),
      userId: uid,
    };

    // Optional fields
    if (fullName) attendanceEntry.fullName = fullName;
    if (userName) attendanceEntry.userName = userName;
    if (checkInTime) attendanceEntry.checkInTime = checkInTime;
    if (breakInTime) attendanceEntry.breakInTime = breakInTime;
    if (breakOutTime) attendanceEntry.breakOutTime = breakOutTime;
    if (breakDuration) attendanceEntry.breakDuration = breakDuration;
    if (checkOutTime) attendanceEntry.checkOutTime = checkOutTime;

    // Count total days the user has marked attendance
    const attendanceSnapshot = await firestore()
      .collection('attendances')
      .get();

    let presentDays = 0;
    attendanceSnapshot.forEach(doc => {
      const data = doc.data();
      if (data[uid]) {
        presentDays += 1;
      }
    });

    attendanceEntry.workingDays = presentDays;

    // Save or update attendance under today's document
    await firestore()
      .collection('attendances')
      .doc(today)
      .set({ [uid]: attendanceEntry }, { merge: true });

    console.log('Attendance saved/updated successfully');
  } catch (error) {
    console.error('Failed to save attendance:', error.message);
    Alert.alert('Error', `Failed to save attendance: ${error.message}`);
  }
};


export const leaveCollection = firestore().collection('leaves');

export { auth };
