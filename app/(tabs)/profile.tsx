import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { Colors } from '../../src/constants/colors';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile, openAuthModal, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.unauthContent}>
          <View style={styles.emptyAvatar}>
            <Ionicons name="person" size={56} color={Colors.gray} />
          </View>
          <Text style={styles.unauthTitle}>Log in to TikTok</Text>
          <Text style={styles.unauthDesc}>
            Manage your profile, check notifications, post videos, and view your liked clips.
          </Text>

          <TouchableOpacity style={styles.loginBtn} onPress={openAuthModal}>
            <Text style={styles.loginBtnText}>Log In or Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const avatar =
    profile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
  const displayName =
    profile?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Creator';
  const username =
    profile?.username ||
    user.user_metadata?.user_name ||
    user.email?.split('@')[0] ||
    'creator';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={{ width: 28 }} />
        <Text style={styles.headerTitle}>{displayName}</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.menuBtn}>
          <Ionicons name="log-out-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Image source={{ uri: avatar }} style={styles.profileAvatar} />
          <Text style={styles.usernameText}>@{username}</Text>
        </View>

        {/* Following / Followers / Likes Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile?.following_count || 142}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile?.followers_count || '12.4K'}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>48.2K</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.profileButtonsRow}>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareProfileBtn}>
            <Feather name="share-2" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Bio */}
        <Text style={styles.bioText}>
          {profile?.bio || '✨ Creating vertical video moments | Powered by React Native & Supabase'}
        </Text>

        {/* Video Grid Tabs */}
        <View style={styles.tabNav}>
          <TouchableOpacity style={[styles.tabNavItem, styles.activeTabNavItem]}>
            <MaterialCommunityIcons name="view-grid" size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabNavItem}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.gray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabNavItem}>
            <Ionicons name="heart-outline" size={22} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Feed Grid Placeholder */}
        <View style={styles.gridPlaceholder}>
          <Ionicons name="videocam-outline" size={48} color={Colors.border} />
          <Text style={styles.gridEmptyTitle}>Upload your first video</Text>
          <Text style={styles.gridEmptySub}>
            Your public and private videos will appear here.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  menuBtn: {
    padding: 4,
  },
  unauthContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  unauthTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  unauthDesc: {
    color: Colors.gray,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  usernameText: {
    color: Colors.gray,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    marginBottom: 18,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.gray,
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
  },
  profileButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  editProfileBtn: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editProfileText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  shareProfileBtn: {
    backgroundColor: Colors.surfaceLight,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioText: {
    color: Colors.white,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
    lineHeight: 20,
  },
  tabNav: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  tabNavItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabNavItem: {
    borderBottomWidth: 2,
    borderColor: Colors.white,
  },
  gridPlaceholder: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridEmptyTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  gridEmptySub: {
    color: Colors.gray,
    fontSize: 13,
  },
});
