import React, { useState, useEffect } from "react";
import {View,Text,TouchableOpacity,Image,ScrollView,Modal,Alert,} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const CorrectionForm = ({ navigation }) => {
  const [corrections, setCorrections] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempEntry, setTempEntry] = useState({ date: "", checkInTime: "", checkOutTime: "" });
  const [showPicker, setShowPicker] = useState(null);
  const [isHR, setIsHR] = useState(false);
  const [requests, setRequests] = useState([]);

  const user = auth().currentUser;

  useEffect(() => {
    const checkHR = () => {
      if (user?.email === "hr1@gmail.com") {
        setIsHR(true);
        fetchRequests();
      }
    };
    checkHR();
  }, []);

  const fetchRequests = async () => {
    const snapshot = await firestore().collection("manualAttendanceRequests").get();
    const data = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const userInfo = await firestore().collection("users").doc(doc.id).get();
        return {
          uid: doc.id,
          entries: doc.data().entries,
          name: userInfo.data()?.name || "",
          image: userInfo.data()?.imageUrl || "",
        };
      })
    );
    setRequests(data);
  };

  const isFormAvailable = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return today.getDate() > lastDay - 5;
  };

  const handleDateTimeChange = (event, selectedDate) => {
    if (!showPicker) return;
    const currentDate = selectedDate || new Date();
    const timeStr = currentDate.toTimeString().slice(0, 5);

    if (showPicker.type === "date") tempEntry.date = currentDate.toISOString().split("T")[0];
    if (showPicker.type === "checkInTime") tempEntry.checkInTime = timeStr;
    if (showPicker.type === "checkOutTime") tempEntry.checkOutTime = timeStr;

    setTempEntry({ ...tempEntry });
    setShowPicker(null);
  };

  const addTempEntry = () => {
    if (!tempEntry.date) return Alert.alert("Date is required");
    setCorrections([...corrections, tempEntry]);
    setTempEntry({ date: "", checkInTime: "", checkOutTime: "" });
    setModalVisible(false);
  };

  const submitRequest = async () => {
    if (corrections.length === 0) return Alert.alert("Please add correction entries");

    await firestore().collection("manualAttendanceRequests").doc(user.uid).set({
      entries: corrections,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    Alert.alert("Submitted", "Correction request submitted.");
    navigation.goBack();
  };

  
const handleAccept = async (entry, uid) => {
  try {
    const todayRef = firestore().collection("attendances").doc(entry.date);
    const docSnapshot = await todayRef.get();
    const dayData = docSnapshot.exists ? docSnapshot.data() : {};

    // Helper to combine date + time into JS Date object
    const toTimestamp = (dateStr, timeStr) => {
      const [hour, minute] = timeStr.split(":").map(Number);
      const date = new Date(dateStr);
      date.setHours(hour);
      date.setMinutes(minute);
      date.setSeconds(0);
      date.setMilliseconds(0);
      return firestore.Timestamp.fromDate(date);
    };

    const updatedEntry = {
      ...(dayData[uid] || {}),
      ...(entry.checkInTime && { checkInTime: toTimestamp(entry.date, entry.checkInTime) }),
      ...(entry.checkOutTime && { checkOutTime: toTimestamp(entry.date, entry.checkOutTime) }),
      lastUpdated: firestore.FieldValue.serverTimestamp(),
      userId: uid,
    };

    await todayRef.set({ [uid]: updatedEntry }, { merge: true });

    await firestore().collection("manualAttendanceRequests").doc(uid).delete();
    fetchRequests();

    Alert.alert("Success", "Correction accepted and attendance updated.");
  } catch (error) {
    console.error("Error accepting correction:", error);
    Alert.alert("Error", "Failed to accept correction.");
  }
};

  const renderHRScreen = () => (
    <ScrollView style={{ padding: 16 }}>
      {requests.map((req, i) => (
        <View
          key={i}
          style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 10 }}
        >
          <Text>Name: {req.name}</Text>
          <Image source={{ uri: req.image }} style={{ width: 50, height: 50, borderRadius: 25 }} />
          {req.entries.map((entry, j) => (
            <View key={j} style={{ marginVertical: 5 }}>
              <Text>Date: {entry.date}</Text>
              <Text>Check In: {entry.checkInTime || "-"}</Text>
              <Text>Check Out: {entry.checkOutTime || "-"}</Text>
              <TouchableOpacity
                style={{ backgroundColor: "green", padding: 5, marginTop: 5 }}
              >
                <Text style={{ color: "white" }}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAccept(entry, req.uid)}
                style={{ backgroundColor: "green", padding: 5, marginTop: 5 }}
              >
                <Text style={{ color: "white" }}>Accept</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  if (isHR) return renderHRScreen();

 return (
  <View style={{ flex: 1 }}>
    {/* Header */}
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
      <TouchableOpacity style={{ margin: 10 }} onPress={() => navigation.goBack()}>
        <Image
          style={{ height: 20, width: 20 }}
          source={{ uri: "https://cdn-icons-png.flaticon.com/128/130/130882.png" }}
        />
      </TouchableOpacity>
      <Text style={{ marginLeft: 90, fontSize: 18 }}>Correction Form</Text>
    </View>

    {/* Form or message */}
    {isFormAvailable() ? (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Correction Form</Text>

      {corrections.map((entry, index) => (
        <View
          key={index}
          style={{ borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 10 }}
        >
          <Text>Date: {entry.date}</Text>
          <Text>Check In: {entry.checkInTime || "-"}</Text>
          <Text>Check Out: {entry.checkOutTime || "-"}</Text>
        </View>
      ))}

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{ backgroundColor: "#007AFF", padding: 10, borderRadius: 8 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>+ Add Field</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={submitRequest}
        style={{ backgroundColor: "green", marginTop: 10, padding: 12, borderRadius: 8 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Submit</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Add Correction</Text>
          <TouchableOpacity
            onPress={() => setShowPicker({ type: "date" })}
            style={{ marginVertical: 5 }}
          >
            <Text>Date: {tempEntry.date || "Select"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowPicker({ type: "checkInTime" })}
            style={{ marginVertical: 5 }}
          >
            <Text>Check In: {tempEntry.checkInTime || "Select"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowPicker({ type: "checkOutTime" })}
            style={{ marginVertical: 5 }}
          >
            <Text>Check Out: {tempEntry.checkOutTime || "Select"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={addTempEntry}
            style={{ backgroundColor: "#007AFF", padding: 10, marginTop: 10, borderRadius: 8 }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={{ padding: 10, marginTop: 10 }}
          >
            <Text style={{ color: "red", textAlign: "center" }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={new Date()}
            mode={showPicker.type === "date" ? "date" : "time"}
            display="default"
            onChange={handleDateTimeChange}
          />
        )}
      </Modal>
    </View>
  ) : (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ fontSize: 16, textAlign: "center" }}>
          Correction Form is only available during the last 5 days of the month.
        </Text>
      </View>
    )}
  </View>
);

};

export default CorrectionForm;

