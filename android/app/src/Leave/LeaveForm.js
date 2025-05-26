import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import DropDownPicker from "react-native-dropdown-picker";
import DatePicker from "react-native-date-picker";

const LeaveForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { onApply } = route.params;

  const [title, setTitle] = useState("");
  const [number, setNumber] = useState("");
  const [leaveType, setLeaveType] = useState(null);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [userData,setUserData]=useState('')

  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);
  const [open, setOpen] = useState(false);

  const [items, setItems] = useState([
    { label: "Medical", value: "medical" },
    { label: "Important Work", value: "important_work" },
    { label: "Other", value: "other" },
  ]);

useEffect(() => {
  const CurrentUser = auth().currentUser;

  const fetchDataUser = async () => {
    try {
      const doc = await firestore().collection('users').doc(CurrentUser.uid).get();
      setUserData(doc.data())
      console.log('uid', CurrentUser.uid);
      console.log('doc', doc.data());
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  if (CurrentUser) {
    
    fetchDataUser();
  } else {
    console.warn('No user is currently logged in');
  }
}, []);

  const handleApply = async () => {
  const user = auth().currentUser;

  if (!user) {
    Alert.alert("Error", "User not logged in.");
    return;
  }

  if (!title || !leaveType || !number || !reason) {
    Alert.alert("Incomplete", "Please fill all fields.");
    return;
  }

  try {
    // ✅ Ensure parent doc exists
    await firestore()
      .collection("leaves")
      .doc(user.uid)
      .set({ createdAt: firestore.FieldValue.serverTimestamp() }, { merge: true });

    // ✅ Now add leave to subcollection
    await firestore()
      .collection("leaves")
      .doc(user.uid)
      .collection("userLeaves")
      .add({
        title,
        contact: number,
        leaveType,
        reason,
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString(),
        status: "Pending",
        email: user.email || "unknown",
        createdAt: firestore.FieldValue.serverTimestamp(),
        userId: user.uid,
        name:userData.name,
        image:userData.imageUrl,
        appliedOn:new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
           day: 'numeric',
        })
      });

    if (onApply) onApply();
    navigation.goBack();
  } catch (error) {
    console.error("Error submitting leave:", error);
    Alert.alert("Error", "Could not apply for leave.");
  }
};


  return (
    <ScrollView>
      <View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={{ margin: 10 }} onPress={() => navigation.goBack()}>
            <Image
              style={{ height: 25, width: 25 }}
              source={{ uri: "https://cdn-icons-png.flaticon.com/128/130/130882.png" }}
            />
          </TouchableOpacity>
          <Text style={{ marginLeft: 90, fontSize: 18 }}>Apply Leave</Text>
        </View>

        <View style={{ margin: 20, gap: 10 }}>
          <View style={{ borderWidth: 1, borderColor: "skyblue", borderRadius: 10, padding: 8 }}>
            <Text style={{ color: "skyblue" }}>Title</Text>
            <TextInput value={title} placeholder="Enter title" onChangeText={setTitle} />
          </View>

          <DropDownPicker
            open={open}
            value={leaveType}
            items={items}
            setOpen={setOpen}
            setValue={setLeaveType}
            setItems={setItems}
            placeholder="Select Leave Type"
            style={{ borderColor: "skyblue", marginBottom: open ? 100 : 0 }}
            dropDownContainerStyle={{ borderRadius: 8 }}
          />

          <View style={{ borderWidth: 1, borderColor: "skyblue", borderRadius: 10, padding: 8 }}>
            <Text style={{ color: "skyblue" }}>Contact Number</Text>
            <TextInput
              value={number}
              placeholder="Enter Contact Number"
              onChangeText={setNumber}
              keyboardType="numeric"
            />
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "skyblue" }}>Start Date</Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: "skyblue",
                borderRadius: 10,
                padding: 10,
                marginTop: 5,
              }}
              onPress={() => setOpenStartDatePicker(true)}
            >
              <Text>{startDate.toDateString()}</Text>
            </TouchableOpacity>
            <DatePicker
              modal
              open={openStartDatePicker}
              date={startDate}
              mode="date"
              onConfirm={(date) => {
                setOpenStartDatePicker(false);
                setStartDate(date);
              }}
              onCancel={() => setOpenStartDatePicker(false)}
            />
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "skyblue" }}>End Date</Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: "skyblue",
                borderRadius: 10,
                padding: 10,
                marginTop: 5,
              }}
              onPress={() => setOpenEndDatePicker(true)}
            >
              <Text>{endDate.toDateString()}</Text>
            </TouchableOpacity>
            <DatePicker
              modal
              open={openEndDatePicker}
              date={endDate}
              mode="date"
              onConfirm={(date) => {
                setOpenEndDatePicker(false);
                setEndDate(date);
              }}
              onCancel={() => setOpenEndDatePicker(false)}
            />
          </View>

          <View style={{ borderWidth: 1, borderColor: "skyblue", borderRadius: 10, padding: 8 }}>
            <Text style={{ color: "skyblue" }}>Reason for Leave</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Enter Reason for Leave"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 100, fontSize: 16 }}
            />
          </View>
        </View>

        <Button title="Apply" onPress={handleApply} />
      </View>
    </ScrollView>
  );
};

export default LeaveForm;
