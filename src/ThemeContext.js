import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

const themes = {
  light: {
    background: '#fff',
    text: '#000',
    card: '#f0f0f0',
    border: '#ccc',
    primary: '#007bff',
  },
  dark: {
    background: '#121212',
    text: '#fff',
    card: '#1e1e1e',
    border: '#444',
    primary: '#1e90ff',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false); // 👈 track if loading is done

  useEffect(() => {
    const loadTheme = async () => {
      const storedValue = await AsyncStorage.getItem('isDarkMode');
      if (storedValue !== null) {
        setIsDarkMode(storedValue === 'true');
      } else {
        setIsDarkMode(systemColorScheme === 'dark');
      }
      setIsThemeLoaded(true);
    };
    loadTheme();
  }, [systemColorScheme]);

  useEffect(() => {
    if (isThemeLoaded) {
      AsyncStorage.setItem('isDarkMode', isDarkMode.toString());
    }
  }, [isDarkMode, isThemeLoaded]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const theme = isDarkMode ? themes.dark : themes.light;

  if (!isThemeLoaded) {
    // Show loading view while theme is being loaded
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
