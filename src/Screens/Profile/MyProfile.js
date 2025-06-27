import { View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useTheme } from '../../ThemeContext';
import AppText from '../../Components/AppText';
import { useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

const MyProfile = ({ navigation }) => {
  const { theme } = useTheme();
  const route = useRoute();
  const { userData } = route.params || {};
  const currentUser = auth().currentUser;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 30 }}>
        <TouchableOpacity style={{ margin: 10 }} onPress={() => navigation.goBack()}>
          <Image
            style={{ height: 20, width: 20, tintColor: theme.text }}
            source={{ uri: "https://cdn-icons-png.flaticon.com/128/130/130882.png" }}
          />
        </TouchableOpacity>
        <AppText style={{ marginLeft: 90, fontSize: 18, fontWeight: 'bold' }}>
          My Profile
        </AppText>
      </View>

      {/* Display Fields */}
      <Image
                style={{ height: 100, width: 100, backgroundColor: '#ccc', borderRadius: 50,alignSelf:'center' }}
                source={{ uri: userData?.imageUrl || '' }}
              />
      <AppText style={{  marginBottom: 5 }}>Name</AppText>
      <View style={{borderWidth:1,borderColor:theme.text,padding:10,borderRadius:10,}}>
        <AppText style={{ fontSize: 18, }}>
        {userData?.name || 'N/A'}
      </AppText>
      </View>

      <AppText style={{  marginBottom: 5 }}>Designation</AppText>
      <View style={{borderWidth:1,borderColor:theme.text,padding:10,borderRadius:10,}}>
        <AppText style={{ fontSize: 18 }}>
        {userData?.designation || 'N/A'}
      </AppText>
      </View>

      <AppText style={{  marginBottom: 5 }}>Role</AppText>
       <View style={{borderWidth:1,borderColor:theme.text,padding:10,borderRadius:10,}}>
         <AppText style={{ fontSize: 18 }}>
        {userData?.role || 'N/A'}
      </AppText>
      </View>

      <AppText style={{  marginBottom: 5 }}>Email</AppText>
       <View style={{borderWidth:1,borderColor:theme.text,padding:10,borderRadius:10,}}>
        <AppText style={{ fontSize: 18,  }}>
        {currentUser?.email || 'N/A'}
      </AppText>
      </View>
      
    </View>
  );
};

export default MyProfile;
