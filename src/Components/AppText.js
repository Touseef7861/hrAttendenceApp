import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../ThemeContext';


const AppText = ({
  children,
  style,
  fontSize = 16,
  fontWeight = 'normal',
  color,
  ...props
}) => {
  const {theme} = useTheme();

  const textStyle = [
    {
      fontSize,
      fontWeight,
      color: color ||  theme.text,
    },
    style,
  ];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

export default AppText;
