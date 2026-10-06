import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

export default function InboxScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Feather name="message-circle" size={64} color={Colors.gray} style={{ marginBottom: 16 }} />
      <Text style={styles.title}>Notifications & Messages</Text>
      <Text style={styles.subtitle}>
        When someone likes your video, leaves a comment, or follows you, you'll see it here.
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
