import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Notification = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const user = auth().currentUser;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        
        const snapshot = await firestore()
          .collection('Notification')
          .doc(user.uid)
          .collection('notifications')
          .orderBy('time', 'desc')
          .get();

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, gap: 20 }}>
      <View style={{ height: 50, width: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', backgroundColor: 'gray' }}>
        <Image style={{ height: 20, width: 20 }} source={{ uri: item.image }} />
      </View>
      <View>
        <Text style={{ fontSize: 15 ,width:250 }}>{item.message}</Text>
        <Text style={{ opacity: 0.5 }}>{item.time?.toDate().toLocaleString() || ''}</Text>
      </View>
    </View>
  );

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
        <TouchableOpacity style={{ margin: 10 }} onPress={() => navigation.goBack()}>
          <Image
            style={{ height: 20, width: 20 }}
            source={{ uri: "https://cdn-icons-png.flaticon.com/128/130/130882.png" }}
          />
        </TouchableOpacity>
        <Text style={{ marginLeft: 90, fontSize: 18 }}>Notification</Text>
      </View>

      {notifications.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
};

export default Notification;
