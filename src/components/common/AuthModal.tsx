import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';

export const AuthModal: React.FC = () => {
  const { isAuthModalVisible, closeAuthModal, signInWithGoogle, signInDemoUser } = useAuth();

  return (
    <Modal
      visible={isAuthModalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeAuthModal}
    >
      <TouchableWithoutFeedback onPress={closeAuthModal}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Sign in to TikTok</Text>
                <TouchableOpacity onPress={closeAuthModal} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                Post videos, like your favorite creators, and join the community.
              </Text>

              {/* Google Sign-In Button */}
              <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
                <AntDesign name="google" size={22} color="#4285F4" style={styles.btnIcon} />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Demo Sign-In Button for Immediate Testing */}
              <TouchableOpacity style={styles.demoButton} onPress={signInDemoUser}>
                <Ionicons name="flash" size={20} color={Colors.primary} style={styles.btnIcon} />
                <Text style={styles.demoBtnText}>Quick Test Sign-In (Demo)</Text>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                By continuing, you agree to TikTok's Terms of Service and Privacy Policy.
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    color: Colors.gray,
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  btnIcon: {
    marginRight: 10,
  },
  googleBtnText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  demoBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  disclaimer: {
    color: Colors.gray,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
