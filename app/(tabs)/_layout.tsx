import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons, AntDesign, Feather } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useAuth } from '../../src/hooks/useAuth';

const TikTokCreateButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.createButtonWrapper} activeOpacity={0.8}>
      <View style={styles.createButtonContainer}>
        <View style={styles.cyanAccent} />
        <View style={styles.pinkAccent} />
        <View style={styles.centerPill}>
          <AntDesign name="plus" size={18} color={Colors.black} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  const handleCreatePress = () => {
    if (!user) {
      openAuthModal();
    } else {
      router.push('/(tabs)/camera');
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopColor: '#202020',
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.white,
        tabBarInactiveTintColor: Colors.gray,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      {/* 1. Home Feed */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 2. Friends / Discover */}
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 3. Create Button (TikTok [+] Icon) */}
      <Tabs.Screen
        name="camera"
        options={{
          title: '',
          tabBarButton: () => <TikTokCreateButton onPress={handleCreatePress} />,
        }}
      />

      {/* 4. Inbox */}
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <Feather name={focused ? 'message-circle' : 'message-square'} size={24} color={color} />
          ),
        }}
      />

      {/* 5. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createButtonWrapper: {
    top: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  createButtonContainer: {
    width: 48,
    height: 30,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cyanAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 38,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
  },
  pinkAccent: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 38,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  centerPill: {
    width: 40,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});
