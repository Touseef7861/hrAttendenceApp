import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../ThemeContext';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const currentUser = auth().currentUser;
  const navigation = useNavigation();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      try {
        const doc = await firestore().collection('users').doc(currentUser.uid).get();
        setUserData(doc.data());
      } catch (error) {
        console.log('error', error);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ alignItems: 'center', marginTop: 50 }}>
        <Image
          style={{ height: 100, width: 100, backgroundColor: '#ccc', borderRadius: 50 }}
          source={{ uri: userData?.imageUrl || '' }}
        />
        <Text style={{ marginTop: 10, fontSize: 20, color: theme.text }}>
          {userData?.name || 'No Name'}
        </Text>
        <Text style={{ color: theme.text }}>{userData?.role || ''}</Text>

        <TouchableOpacity
          style={{
            height: 50,
            width: '90%',
            backgroundColor: theme.primary,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            marginTop: 10,
          }}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={{ color: '#fff', fontSize: 15 }}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={{ margin: 20 }}>
        {[
          {
            icon: 'https://cdn-icons-png.flaticon.com/128/456/456283.png',
            label: 'My Profile',
            onPress: () => navigation.navigate('MyProfile',{userData}),
          },
          {
            icon: 'https://cdn-icons-png.flaticon.com/128/3364/3364202.png',
            label: 'Settings',
            onPress: () => navigation.navigate('Settings'),
            
          },
          {
            icon: 'https://cdn-icons-png.flaticon.com/128/10349/10349096.png',
            label: 'Terms & Conditions',
            onPress: () => {},
          },
          {
            icon: 'https://cdn-icons-png.flaticon.com/128/10348/10348976.png',
            label: 'Privacy Policy',
            onPress: () => {},
          },
        ].map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: index === 0 ? 0 : 20,
            }}
          >
            <View
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
                backgroundColor: theme.card,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image style={{ height: 18, width: 18 ,tintColor: theme.text}} source={{ uri: item.icon }} />
            </View>
            <Text style={{ fontSize: 15, width: 240, color: theme.text }}>{item.label}</Text>
            <TouchableOpacity onPress={item.onPress}>
              <Image
                style={{ height: 15, width: 15 ,tintColor: theme.text}}
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/271/271228.png',
                }}
              />
            </TouchableOpacity>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={async () => {
            try {
              await auth().signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.log('Logout error:', error);
            }
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginTop: 20,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: '#ffcccc',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              style={{ height: 18, width: 18 }}
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/10405/10405584.png',
              }}
            />
          </View>
          <Text style={{ fontSize: 15, width: 240, color: 'red' }}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;
