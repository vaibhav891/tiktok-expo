import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/hooks/useAuth';
import { AuthModal } from '../src/components/common/AuthModal';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="post-preview"
            options={{
              presentation: 'card',
              headerShown: false,
            }}
          />
        </Stack>
        <AuthModal />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
