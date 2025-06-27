import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import { useTheme } from "../ThemeContext";
import AppText from "../Components/AppText";
import AppButton from "../Components/AppButton";

const ChangePassword = () => {
  const navigation = useNavigation();
  const [hide, setHide] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { theme } = useTheme();

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            style={[styles.icon, { tintColor: theme.text }]}
            source={{ uri: "https://cdn-icons-png.flaticon.com/128/130/130882.png" }}
          />
        </TouchableOpacity>
        <AppText style={[styles.headerTitle, { color: theme.text }]}>
          Change Password
        </AppText>
      </View>

      {/* Password Field */}
      <View style={[styles.inputContainer, { borderColor: theme.primary }]}>
        <AppText style={[styles.label, { color: theme.primary }]}>New Password</AppText>
        <View style={styles.inputRow}>
          <TextInput
            value={password}
            placeholder="Enter new password"
            placeholderTextColor={theme.text + '88'}
            onChangeText={setPassword}
            secureTextEntry={hide}
            style={[styles.textInput, { color: theme.text }]}
          />
          <TouchableOpacity onPress={() => setHide(!hide)}>
            <Image
              style={[styles.icon, { tintColor: theme.text }]}
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
      <View style={[styles.inputContainer, { borderColor: theme.primary }]}>
        <AppText style={[styles.label, { color: theme.primary }]}>Confirm Password</AppText>
        <View style={styles.inputRow}>
          <TextInput
            value={confirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor={theme.text + '88'}
            onChangeText={setConfirmPassword}
            secureTextEntry={hide}
            style={[styles.textInput, { color: theme.text }]}
          />
          <TouchableOpacity onPress={() => setHide(!hide)}>
            <Image
              style={[styles.icon, { tintColor: theme.text }]}
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
      <AppButton
        onPress={handlePasswordUpdate}
        style={styles.updateButton}
        textStyle={styles.updateButtonText}
      >
        Update Password
      </AppButton>
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 15,
    height: 60,
    width: '90%',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 15,
    marginTop: 20,
  },
  label: {
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
    alignSelf: 'center',
    justifyContent: "center",
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 60,
  },
  updateButtonText: {
    fontSize: 15,
  },
});
