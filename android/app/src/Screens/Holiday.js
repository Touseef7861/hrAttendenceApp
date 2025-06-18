import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";

const Holiday = () => {
  const [hr, setHr] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const user = auth().currentUser;

  useEffect(() => {
    if (user?.email === "hr1@gmail.com") {
      setHr(true);
    }

    const unsubscribe = firestore()
      .collection("holidays")
      .orderBy("startDate", "desc")
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHolidays(data);
      });

    return unsubscribe;
  }, []);

  const addHoliday = async () => {
    if (!reason.trim()) return Alert.alert("Please enter reason");

    const newHoliday = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      reason,
      createdAt: firestore.FieldValue.serverTimestamp(),
      createdBy: user.email,
    };

    try {
      const docRef = await firestore().collection("holidays").add(newHoliday);

      // Send notification
      await firestore().collection("Notifications").add({
        message: `📢 Holiday announced: ${reason} (${moment(startDate).format(
          "MMM D"
        )} to ${moment(endDate).format("MMM D")})`,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      setModalVisible(false);
      setReason("");
    } catch (error) {
      Alert.alert("Error adding holiday", error.message);
    }
  };

  const deleteHoliday = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await firestore().collection("holidays").doc(id).delete();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>📅 Holidays</Text>

      {hr && (
        <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(8, 131, 180, 1)",
            marginBottom: 20,
            height: 40,
            borderRadius: 8,
          }}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Add Holiday</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={holidays}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#f0f0f0",
              padding: 15,
              marginBottom: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {item.reason}
            </Text>
            <Text>
              {moment(item.startDate).format("MMM D")} -{" "}
              {moment(item.endDate).format("MMM D")}
            </Text>
            <Text>Announced by: {item.createdBy}</Text>

            {hr && (
              <TouchableOpacity
                onPress={() => deleteHoliday(item.id)}
                style={{ marginTop: 5 }}
              >
                <Text style={{ color: "red" }}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* MODAL */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              padding: 20,
              height: "60%",
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <Text style={{ fontSize: 20, textAlign: "center" }}>
              Add a Holiday
            </Text>

            <Text style={{ marginTop: 15 }}>Start Date</Text>
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              style={{
                borderWidth: 1,
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <Text>{moment(startDate).format("YYYY-MM-DD")}</Text>
            </TouchableOpacity>

            <Text>End Date</Text>
            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              style={{
                borderWidth: 1,
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <Text>{moment(endDate).format("YYYY-MM-DD")}</Text>
            </TouchableOpacity>

            <Text>Reason</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="e.g., Eid Holidays"
              style={{
                borderWidth: 1,
                padding: 10,
                borderRadius: 8,
                marginBottom: 20,
              }}
            />

            <TouchableOpacity
              onPress={addHoliday}
              style={{
                backgroundColor: "blue",
                padding: 12,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Save Holiday
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}
    </View>
  );
};

export default Holiday;
