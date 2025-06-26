import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AppText from './AppText';
import { useTheme } from '../ThemeContext';

const AppButton = ({ children, onPress, style, textStyle, ...props }) => {
  const { theme } = useTheme(); // Access `theme` from ThemeContext

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button(theme), style]}
      {...props}
    >
      <AppText style={[styles.text(theme), textStyle]}>
        {children}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = {
  button: theme => ({
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  }),
  text: theme => ({
   
    color: theme.background === '#121212' ? '#fff' : '#000',
    fontSize: 16,
    fontWeight: 'bold',
  }),
};

export default AppButton;
