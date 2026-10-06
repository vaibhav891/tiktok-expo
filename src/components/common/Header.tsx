import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface HeaderProps {
  onSearchPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchPress }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'following' | 'foryou'>('foryou');

  return (
    <View style={[styles.container, { top: insets.top + 8 }]}>
      {/* Live Stream icon */}
      <TouchableOpacity style={styles.iconBtn}>
        <Feather name="tv" size={22} color={Colors.white} />
      </TouchableOpacity>

      {/* Following / For You Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('following')}
          style={styles.tabItem}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'following' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            Following
          </Text>
          {activeTab === 'following' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('foryou')}
          style={styles.tabItem}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'foryou' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            For You
          </Text>
          {activeTab === 'foryou' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Search icon */}
      <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
        <Ionicons name="search" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconBtn: {
    padding: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabItem: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
  },
  tabTextActive: {
    color: Colors.white,
  },
  tabTextInactive: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tabIndicator: {
    width: 24,
    height: 3,
    backgroundColor: Colors.white,
    borderRadius: 2,
    marginTop: 4,
  },
});
