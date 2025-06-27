import React from 'react';
import { View, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../ThemeContext';
import AppText from '../../Components/AppText';
import { color } from 'react-native-elements/dist/helpers';

const ViewAll = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const { activityLog = [] } = route.params || {};

  const renderItem = ({ item }) => {
    let iconUri = '';
    switch (item.type) {
      case 'Check In':
        iconUri = 'https://cdn-icons-png.flaticon.com/128/906/906801.png';
        break;
      case 'Check Out':
        iconUri = 'https://cdn-icons-png.flaticon.com/128/992/992680.png';
        break;
      case 'Break In':
      case 'Break Out':
        iconUri = 'https://cdn-icons-png.flaticon.com/128/751/751621.png';
        break;
    }

    return (
      <View style={{ padding: 15, marginBottom: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',backgroundColor:'white', borderRadius:10 }}>
        <Image source={{ uri: iconUri }} style={{ width: 20, height: 20, marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 15,color:'black' }}>{item.type}</AppText>
          <AppText style={{ fontSize: 10 ,color:'black'}}>{item.now}</AppText>
        </View>
        <View>
          <AppText style={{ fontSize: 15,color:'black' }}>{item.time}</AppText>
          <AppText style={{ fontSize: 10,color:'black' }}>on Time</AppText>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 30 }}>
        <TouchableOpacity style={{ margin: 10 }} onPress={() => navigation.goBack()}>
          <Image
            style={{ height: 20, width: 20, tintColor: theme.text }}
            source={{ uri: "https://cdn-icons-png.flaticon.com/128/130/130882.png" }}
          />
        </TouchableOpacity>
        <AppText style={{ fontSize: 18, fontWeight: 'bold' }}>
          Your Attendance Activity
        </AppText>
      </View>

      <FlatList
        data={activityLog}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
};

export default ViewAll;
