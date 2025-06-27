import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image ,TextInput} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../ThemeContext';
import AppText from '../../Components/AppText';
import AppButton from '../../Components/AppButton';

const Team = () => {
  const currentUser = auth().currentUser;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,setSearch] = useState('')
  const [isHR, setIsHR] = useState(false);
  const navigation = useNavigation();
  const {theme} = useTheme()

  useEffect(() => {
    if (currentUser.email === 'hr1@gmail.com') {
      setIsHR(true);
      firestore().collection('users').get().then(snapshot => {
        const usersList = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
        setLoading(false);
      });
    } else {
      setLoading(false);
      
      navigation.replace('AttendanceData', {
        uid: currentUser.uid,
        userName: currentUser.displayName || 'Me',
        isHR: false,
      });
    }
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

   const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <ScrollView style={{ padding: 20 ,backgroundColor:theme.background}}>
     {isHR && (
        <>
         <View style={{flexDirection:"row",alignItems:'center'}}>
           <AppText style={{ fontSize: 25, fontWeight: 'bold', marginBottom: 10 }}>Team Members</AppText>

          {/* <TouchableOpacity >
            <Image style={{ height: 25, width: 25,marginLeft:120 }}
                source={{ uri: 'https://cdn-icons-png.flaticon.com/128/2311/2311524.png' }}/>
          </TouchableOpacity> */}
         </View>
          <View style={{ padding: 8, borderWidth: 1, borderRadius: 15, borderColor:theme.text, marginBottom: 20,marginTop:25,flexDirection:'row',alignItems:'center' }}>
            <Image style={{ height: 23, width: 23,tintColor:theme.text }}
                source={{ uri: 'https://cdn-icons-png.flaticon.com/128/149/149852.png' }}/>
            <TextInput
              value={search}
              placeholder="Search"
              onChangeText={setSearch}
              style={{color:theme.text}}
              placeholderTextColor={theme.text}
            />
          </View>

          {filteredUsers.map(user => (
            <TouchableOpacity
              key={user.uid}
              style={{
                padding: 15,
                backgroundColor: '#eee',
                marginBottom: 10,
                borderRadius: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor:theme.background,
                
              }}
              onPress={() =>
                navigation.navigate('AttendanceData', {
                  uid: user.uid,
                  userName: user.name || user.email,
                  isHR: true,
                })
              }
            > 
              <Image
                style={{ height: 60, width: 60, borderRadius: 30 }}
                source={{ uri: user.imageUrl }}
              />
              <View>
                <AppText>{user.name}</AppText>
                <AppText style={{ opacity: 0.5 }}>{user.role}</AppText>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
};

export default Team;
