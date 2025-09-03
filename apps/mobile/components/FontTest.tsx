import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextStyles } from '@/constants/Fonts';

export default function FontTest() {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, TextStyles.heading.h1]}>
        Inter Variable Font - Bold
      </Text>
      
      <Text style={[styles.subtitle, TextStyles.heading.h2]}>
        Inter Variable Font - SemiBold
      </Text>
      
      <Text style={[styles.body, TextStyles.body.medium]}>
        Inter Variable Font - Regular (Body Text)
      </Text>
      
      <Text style={[styles.poppins, { fontFamily: 'Poppins-Bold' }]}>
        Poppins Bold - Secondary Font
      </Text>
      
      <Text style={[styles.poppins, { fontFamily: 'Poppins-Regular' }]}>
        Poppins Regular - Secondary Font
      </Text>
      
      <Text style={[styles.mono, { fontFamily: 'JetBrainsMono-VariableFont_wght' }]}>
        JetBrains Mono - Monospace Font
      </Text>
      
      <Text style={[styles.spaceMono, { fontFamily: 'SpaceMono-Regular' }]}>
        Space Mono - Additional Font
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    marginBottom: 10,
    color: '#555',
  },
  body: {
    marginBottom: 20,
    color: '#666',
    lineHeight: 24,
  },
  poppins: {
    marginBottom: 10,
    fontSize: 18,
    color: '#444',
  },
  mono: {
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  spaceMono: {
    marginBottom: 10,
    fontSize: 14,
    color: '#555',
    backgroundColor: '#e8e8e8',
    padding: 6,
    borderRadius: 3,
  },
});
