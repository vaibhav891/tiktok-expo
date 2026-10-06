import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

export default function FriendsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Ionicons name="people-outline" size={64} color={Colors.gray} style={{ marginBottom: 16 }} />
      <Text style={styles.title}>Find Your Friends</Text>
      <Text style={styles.subtitle}>
        Connect with your contacts or link Google accounts to discover videos from people you know.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.gray,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
