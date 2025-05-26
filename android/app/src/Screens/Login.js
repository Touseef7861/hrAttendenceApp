import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';


const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
   const [hide, setHide] = useState(true);

  const handleSignIn = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        Alert.alert('Login successful');
        // Navigate to the bottom tabs screen
        navigation.replace('BottomTabs');
      })
      .catch(error => {
        Alert.alert('Login failed', error.message);
      });
  };

  return (
    <View style={{ flex: 1,backgroundColor:'white' }}>
      <Image
        style={{ height: 90, width: 90, marginTop: 20 }}
        source={{
          uri: 'https://media.licdn.com/dms/image/v2/D4D0BAQFPrR_MWMq_QQ/company-logo_200_200/company-logo_200_200/0/1723714983811/the_first_sol_logo?e=2147483647&v=beta&t=f3O5sgdVp-74IpCtm3UCIkAZ9NCZ_qwg1P_3e85EVhk'
        }}
      />
      <View style={{ marginLeft: 15 }}>
        <Text style={{ fontSize: 28 }}>Welcome Back</Text>
        <Text style={{ fontSize: 28 }}>
          to <Text style={{ color: 'blue' }}>HR Attendee</Text>
        </Text>
        <Text style={{ fontSize: 15, opacity: 0.4 }}>Hello there, login to continue</Text>
      </View>
      <View style={{
        borderWidth: 1, borderColor: 'blue', borderRadius: 15, height: 60, width: '90%',
        paddingVertical: 5, paddingHorizontal: 10, margin: 15
      }}>
        <Text style={{ color: 'skyblue' }}>Email Address</Text>
        <TextInput
          value={email}
          placeholder="Enter your Email"
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={{
        borderWidth: 1, borderColor: 'blue', borderRadius: 15, height: 60, width: '90%',
        paddingVertical: 5, paddingHorizontal: 10, marginHorizontal: 15
      }}>
        <Text style={{ color: 'skyblue' }}>Password</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <TextInput
          value={password}
          placeholder="Enter your Password"
          onChangeText={setPassword}
          secureTextEntry={hide}
          style={{width:270}}
        />
        <TouchableOpacity
                style={{  }}
                onPress={() => setHide(!hide)} // Toggle hide state
              >
                <Image
                  style={{ height: 20, width: 20 }}
                  source={{
                    uri: hide
                      ? "https://cdn-icons-png.flaticon.com/128/17091/17091358.png"
                      : "https://cdn-icons-png.flaticon.com/128/9684/9684835.png",
                  }}
                />
              </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity>
        <Text style={{ color: 'skyblue', alignSelf: 'flex-end', margin: 10, marginRight: 25 }}>
        Forgot Password?
      </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          margin: 10, height: 50, width: '90%', backgroundColor: 'skyblue',
          borderRadius: 10, justifyContent: 'center', alignItems: 'center'
        }}
        onPress={handleSignIn}
      >
        <Text style={{ color: 'white' }}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
