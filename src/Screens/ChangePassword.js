import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";

const ChangePassword = () => {
  const navigation = useNavigation();
  const [hide, setHide] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordUpdate = () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    const user = auth().currentUser;
    if (user) {
      user.updatePassword(password)
        .then(() => {
          Alert.alert("Success", "Password updated successfully.");
          navigation.goBack();
        })
        .catch(error => {
          Alert.alert("Error", error.message);
        });
    } else {
      Alert.alert("Error", "No user is logged in.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            style={styles.icon}
            source={{ uri: "https://cdn-icons-png.flaticon.com/128/130/130882.png" }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>

      {/* Password Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={password}
            placeholder="Enter new password"
            onChangeText={setPassword}
            secureTextEntry={hide}
            style={styles.textInput}
          />
          <TouchableOpacity onPress={() => setHide(!hide)}>
            <Image
              style={styles.icon}
              source={{
                uri: hide
                  ? "https://cdn-icons-png.flaticon.com/128/17091/17091358.png"
                  : "https://cdn-icons-png.flaticon.com/128/9684/9684835.png"
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm Password Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={confirmPassword}
            placeholder="Confirm new password"
            onChangeText={setConfirmPassword}
            secureTextEntry={hide}
            style={styles.textInput}
          />
          <TouchableOpacity onPress={() => setHide(!hide)}>
            <Image
              style={styles.icon}
              source={{
                uri: hide
                  ? "https://cdn-icons-png.flaticon.com/128/17091/17091358.png"
                  : "https://cdn-icons-png.flaticon.com/128/9684/9684835.png"
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Update Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handlePasswordUpdate}>
        <Text style={styles.updateButtonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePassword;

// 🌟 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  backButton: {
    margin: 10,
  },
  icon: {
    height: 20,
    width: 20,
  },
  headerTitle: {
    marginLeft: 90,
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: 15,
    height: 60,
    width: '90%',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 15,
    marginTop: 20,
  },
  label: {
    color: 'skyblue',
    marginBottom: 3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    width: 270,
    fontSize: 16,
  },
  updateButton: {
    height: 50,
    width: '90%',
    justifyContent: "center",
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'skyblue',
    margin: 20,
    marginTop: 400,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 15,
  },
});
