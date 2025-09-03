import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '../ThemeProvider';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  size?: 'thin' | 'medium' | 'thick';
  margin?: number;
}

export default function Divider({
  orientation = 'horizontal',
  size = 'thin',
  margin = 16
}: DividerProps) {
  const colors = useThemeColors();

  const getSizeStyle = () => {
    switch (size) {
      case 'medium':
        return { width: 2, height: 2 };
      case 'thick':
        return { width: 4, height: 4 };
      default:
        return { width: 1, height: 1 };
    }
  };

  const sizeStyle = getSizeStyle();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.border,
          marginVertical: orientation === 'horizontal' ? margin : 0,
          marginHorizontal: orientation === 'vertical' ? margin : 0,
          width: orientation === 'horizontal' ? '100%' : sizeStyle.width,
          height: orientation === 'vertical' ? '100%' : sizeStyle.height,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
});
