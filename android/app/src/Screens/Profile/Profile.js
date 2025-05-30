import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const CurrentUser = auth().currentUser;
  const navigattion=useNavigation()
  useEffect(() => {
    const fetchData = async () => {
      if (!CurrentUser) return;

      console.log('uid', CurrentUser.uid);
      try {
        const doc = await firestore().collection('users').doc(CurrentUser.uid).get();
        setUserData(doc.data());
      } catch (error) {
        console.log('error', error);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: 'center', marginTop: 50 }}>
        <Image
          style={{ height: 100, width: 100, backgroundColor: 'gray', borderRadius: 50 }}
          source={{ uri: userData?.imageUrl || '' }}
        />
        <Text style={{ marginTop: 10, fontSize: 20 }}>{userData?.name || 'No Name'}</Text>
        <Text>{userData?.role || ''}</Text>

        <TouchableOpacity style={{height: 50,width: '90%',backgroundColor: 'skyblue',justifyContent: 'center',alignItems: 'center',borderRadius: 10,marginTop: 10,}}
        onPress={()=> navigattion.navigate('EditProfile')}>
          <Text style={{ color: 'white', fontSize: 15 }}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <View style={{margin:20}}>
        <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:'lightgray',justifyContent:'center',alignItems:'center'}}>
            <Image style={{height:18,width:18}} source={{uri:'https://cdn-icons-png.flaticon.com/128/456/456283.png'}}/>
          </View>
          <Text style={{fontSize:15,width:240}}>My Profile</Text>
          <TouchableOpacity>
            <Image style={{height:15,width:15,}} source={{uri:'https://cdn-icons-png.flaticon.com/128/271/271228.png'}}/>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection:"row",alignItems:"center",gap:10,marginTop:20}}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:'lightgray',justifyContent:'center',alignItems:'center'}}>
            <Image style={{height:18,width:18}} source={{uri:'https://cdn-icons-png.flaticon.com/128/3364/3364202.png'}}/>
          </View>
          <Text style={{fontSize:15,width:240}}>Settings</Text>
          <TouchableOpacity>
            <Image style={{height:15,width:15,}} source={{uri:'https://cdn-icons-png.flaticon.com/128/271/271228.png'}}/>
          </TouchableOpacity>
        </View>
         <View style={{flexDirection:"row",alignItems:"center",gap:10,marginTop:20}}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:'lightgray',justifyContent:'center',alignItems:'center'}}>
            <Image style={{height:18,width:18}} source={{uri:'https://cdn-icons-png.flaticon.com/128/10349/10349096.png'}}/>
          </View>
          <Text style={{fontSize:15,width:240}}>Terms & Conditions</Text>
          <TouchableOpacity>
            <Image style={{height:15,width:15,}} source={{uri:'https://cdn-icons-png.flaticon.com/128/271/271228.png'}}/>
          </TouchableOpacity>
        </View>
         <View style={{flexDirection:"row",alignItems:"center",gap:10,marginTop:20}}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:'lightgray',justifyContent:'center',alignItems:'center'}}>
            <Image style={{height:18,width:18}} source={{uri:'https://cdn-icons-png.flaticon.com/128/10348/10348976.png'}}/>
          </View>
          <Text style={{fontSize:15,width:240}}>Privacy Policy</Text>
          <TouchableOpacity>
            <Image style={{height:15,width:15,}} source={{uri:'https://cdn-icons-png.flaticon.com/128/271/271228.png'}}/>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
        onPress={async () => {
        try {
        await auth().signOut();
        navigattion.reset({
        index: 0,
        routes: [{ name: 'Login' }], 
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  }}
  style={{flexDirection: 'row',alignItems: 'center',gap: 10,marginTop: 20,padding: 10,borderRadius: 10,}}>
  <View style={{height: 40,width: 40,borderRadius: 20,backgroundColor: '#ffe6e6',justifyContent: 'center',alignItems: 'center',}}>
    <Image style={{ height: 18, width: 18 }} source={{uri: 'https://cdn-icons-png.flaticon.com/128/10405/10405584.png',}}/>
  </View>
  <Text style={{ fontSize: 15, width: 240, color: 'red' }}>Log out</Text>
</TouchableOpacity>
      </View>
      
    </View>
  );
};

export default Profile;
