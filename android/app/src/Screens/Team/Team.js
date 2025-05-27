import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image ,TextInput} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const Team = () => {
  const currentUser = auth().currentUser;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,setSearch] = useState('')
  const navigation = useNavigation();

  useEffect(() => {
    if (currentUser.email === 'hr1@gmail.com') {
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
      
      navigation.navigate('AttendanceData', {
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
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Team Members</Text>
      <View style={{padding:8,borderWidth:1,borderRadius:15,borderColor:"blue"}}>
        <TextInput
        value={search}
        placeholder='Search the User'
        onChangeText={setSearch}
      />
      </View>
      {filteredUsers.map(user => (
        <TouchableOpacity
          key={user.uid}
          style={{ padding: 15, backgroundColor: '#eee', marginBottom: 10, borderRadius: 6 ,flexDirection:'row',alignItems:'center',gap:10}}
          onPress={() => navigation.navigate('AttendanceData', {
            uid: user.uid,
            userName: user.name || user.email,
            isHR: true,
          })}
        >
        
          <Image  style={{height:60,width:60,borderRadius:30}} source={{uri:user.imageUrl}}/>
          <View>
            <Text>{user.name}</Text>
            <Text style={{opacity:0.5}}>{user.role}</Text>
          </View>
        
          
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Team;
