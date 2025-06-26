import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { ThemeProvider } from './src/ThemeContext';
import auth from '@react-native-firebase/auth';
import Navigation from './src/Navigation/Navigation';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash || initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <Image
          style={{ height: '40%', width: '50%' }}
          source={{
            uri: 'https://media.licdn.com/dms/image/v2/D4D0BAQFPrR_MWMq_QQ/company-logo_200_200/company-logo_200_200/0/1723714983811/the_first_sol_logo?e=2147483647&v=beta&t=f3O5sgdVp-74IpCtm3UCIkAZ9NCZ_qwg1P_3e85EVhk',
          }}
        />
        <ActivityIndicator size="large" color="skyblue" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Navigation user={user} />
    </ThemeProvider>
  );
};

export default App;
