import React from 'react';
import {Image} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Login from '../Screens/Login';
import Home from '../Screens/Home/Home';
import Application from '../Screens/Application/Application';
import Team from '../Screens/Team/Team';
import Holidays from '../Screens/Holiday';
import Profile from '../Screens/Profile/Profile';
import LeaveForm from '../Screens/Application/LeaveForm';
import LeaveDetails from '../Screens/Application/LeaveDetails';
import EditProfile from '../Screens/Profile/EditProfile';
import ChangePassword from '../Screens/ChangePassword';
import AttendanceData from '../Screens/Team/AttendenceData';
import CorrectionForm from '../Screens/Home/CorrectionForm';
import Notification from '../Screens/Home/Notification';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={Home} 
        options={{
          headerShown:(false),
          tabBarIcon: () => (
            <Image style={{height:30,width:30,borderRadius:15}}source={{uri:'https://cdn-icons-png.flaticon.com/128/553/553416.png'}}/>
          ),
          tabBarLabel: '',
        }}
    />
    <Tab.Screen name="Application" component={Application} 
        options={{
            headerShown:(false),
            tabBarIcon:()=>(
                <Image style={{height:30,width:30,borderRadius:15}} source={{uri:'https://cdn-icons-png.flaticon.com/128/12887/12887924.png'}}/>
            ),
            tabBarLabel: '',
        }}
    />
    <Tab.Screen name="Team" component={TeamStack}
    options={{
        headerShown:(false),
        tabBarIcon:()=>(
            <Image style={{height:30,width:30,borderRadius:15}} source={{uri:'https://cdn-icons-png.flaticon.com/128/15047/15047490.png'}}/>
        ),
        tabBarLabel: '',
    }} />
    <Tab.Screen name="Holidays" component={Holidays}
    options={{
        headerShown:(false),
        tabBarIcon:()=>(
            <Image style={{height:30,width:30,borderRadius:15}} source={{uri:'https://cdn-icons-png.flaticon.com/128/3126/3126507.png'}}/>
        ),
        tabBarLabel: '',
    }} />
    <Tab.Screen name="Profile" component={Profile} 
         options={{
        headerShown:(false),
        tabBarIcon:()=>(
            <Image style={{height:30,width:30,borderRadius:15}} source={{uri:'https://cdn-icons-png.flaticon.com/128/456/456283.png'}}/>
        ),
        tabBarLabel: '',
    }} 
    /> 
  </Tab.Navigator>
);

const TeamStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Team" component={Team} />
      <Stack.Screen name="AttendanceData" component={AttendanceData} />
    </Stack.Navigator>
  );
};

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="BottomTabs" component={BottomTabs} />
        <Stack.Screen name="LeaveForm" component={LeaveForm} />
        <Stack.Screen name="LeaveDetails" component={LeaveDetails} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="TeamList" component={Team} />
        <Stack.Screen name="AttendanceData" component={AttendanceData} />
        <Stack.Screen name="CorrectionForm" component={CorrectionForm} />
        <Stack.Screen name="Notification" component={Notification} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
