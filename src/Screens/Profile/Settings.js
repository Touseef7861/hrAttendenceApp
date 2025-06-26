import React, { useEffect, useRef } from 'react';
import { View, Text, Switch, TouchableOpacity, Image, Animated } from 'react-native';
import { useTheme } from '../../ThemeContext';
import AppText from '../../Components/AppText';

const Settings = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
        <TouchableOpacity style={{ margin: 10 }} onPress={() => navigation.goBack()}>
          <Image
            style={{ height: 20, width: 20 ,tintColor: theme.text}}
            source={{ uri: "https://cdn-icons-png.flaticon.com/128/130/130882.png" }}
          />
        </TouchableOpacity>
        <Text style={{ marginLeft: 90, fontSize: 18, color: theme.text }}>Settings</Text>
      </View>

      <View style={{flexDirection:'row',justifyContent:"space-between"}}>
        <Animated.View style={{ opacity: fadeAnim, margin: 20 }}>
        <AppText fontSize={20} color={theme.text}>
          Dark Mode
        </AppText>
      </Animated.View>
      <Switch
        value={isDarkMode}
        onValueChange={toggleTheme}
        thumbColor={isDarkMode ? '#fff' : '#000'}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
      />
      </View>

      
      
    </View>
  );
};

export default Settings;
