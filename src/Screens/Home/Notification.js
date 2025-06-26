import React, { useEffect, useState } from 'react';
import { View, Image, FlatList } from 'react-native';
import AppText from '../../Components/AppText';
import AppButton from '../../Components/AppButton';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useTheme } from '../../ThemeContext';

const Notification = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const user = auth().currentUser;
  const { theme } = useTheme(); 

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
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderColor: theme.border,
      }}
    >
      <View
        style={{
          height: 50,
          width: 50,
          borderRadius: 25,
          backgroundColor: theme.card,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
        }}
      >
        <Image style={{ height: 20, width: 20 }} source={{ uri: item.image }} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText fontSize={15} style={{ marginBottom: 4 }} color={theme.text}>
          {item.message}
        </AppText>
        <AppText fontSize={12} color={theme.subText || '#999'}>
          {item.time?.toDate().toLocaleString() || ''}
        </AppText>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 0.5,
          borderColor: theme.border,
        }}
      >
        <AppButton
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: 'transparent',
            paddingVertical: 0,
            paddingHorizontal: 0,
            marginVertical: 0,
          }}
        >
          <Image
            style={{ height: 24, width: 24,tintColor: theme.text }}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/130/130882.png',
            }}
          />
        </AppButton>

        <AppText fontSize={18} style={{ marginLeft: 16, fontWeight: 'bold' }} color={theme.text}>
          Notification
        </AppText>
      </View>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <AppText style={{ textAlign: 'center', marginTop: 40 }} color={theme.text}>
          No notifications
        </AppText>
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
