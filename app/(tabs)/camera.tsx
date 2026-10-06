import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraRecorder } from '../../src/components/camera/CameraRecorder';
import { useAuth } from '../../src/hooks/useAuth';
import { Colors } from '../../src/constants/colors';

export default function CameraScreen() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    if (!user) {
      openAuthModal();
    }
  }, [user]);

  const handleVideoCaptured = (uri: string) => {
    router.push({
      pathname: '/post-preview',
      params: { videoUri: uri },
    });
  };

  const handleClose = () => {
    router.replace('/(tabs)');
  };

  if (!user) {
    return (
      <View style={styles.unauthContainer}>
        <Ionicons name="lock-closed-outline" size={60} color={Colors.primary} style={{ marginBottom: 16 }} />
        <Text style={styles.unauthTitle}>Login Required to Post</Text>
        <Text style={styles.unauthSub}>
          Sign in with Google to record videos, upload clips, and share with your audience.
        </Text>

        <TouchableOpacity style={styles.signInButton} onPress={openAuthModal}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Text style={styles.backButtonText}>Return to Feed</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraRecorder
        onVideoCaptured={handleVideoCaptured}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  unauthContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  unauthTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  unauthSub: {
    color: Colors.gray,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  signInButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: Colors.gray,
    fontSize: 14,
  },
});
