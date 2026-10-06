import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

interface CameraRecorderProps {
  onVideoCaptured: (uri: string) => void;
  onClose: () => void;
}

export const CameraRecorder: React.FC<CameraRecorderProps> = ({
  onVideoCaptured,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const toggleTorch = () => {
    setTorch((prev) => !prev);
  };

  const startTimer = () => {
    setRecordSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordSeconds((prev) => {
        if (prev >= 60) {
          stopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      setIsRecording(true);
      startTimer();

      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });

      stopTimer();
      setIsRecording(false);

      if (video?.uri) {
        onVideoCaptured(video.uri);
      }
    } catch (err: any) {
      console.warn('Recording error:', err);
      stopTimer();
      setIsRecording(false);
      Alert.alert('Recording Failed', err.message || 'Could not record video');
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      stopTimer();
      setIsRecording(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onVideoCaptured(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('Gallery pick error:', err);
      Alert.alert('Error', 'Failed to pick video from library');
    }
  };

  // Permission handling
  if (!cameraPermission || !micPermission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={[styles.permissionContainer, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.closeBtnCorner} onPress={onClose}>
          <Ionicons name="close" size={28} color={Colors.white} />
        </TouchableOpacity>
        <Ionicons name="videocam-outline" size={64} color={Colors.primary} style={{ marginBottom: 16 }} />
        <Text style={styles.permissionTitle}>Camera & Mic Access Needed</Text>
        <Text style={styles.permissionSub}>
          To create videos on TikTok, allow access to your camera and microphone.
        </Text>
        <TouchableOpacity
          style={styles.grantButton}
          onPress={async () => {
            await requestCameraPermission();
            await requestMicPermission();
          }}
        >
          <Text style={styles.grantButtonText}>Grant Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.galleryFallbackButton} onPress={pickFromGallery}>
          <Ionicons name="images-outline" size={20} color={Colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.galleryFallbackText}>Upload from Gallery Instead</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        mode="video"
        enableTorch={torch}
      />

      {/* Top Bar */}
      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <TouchableOpacity onPress={onClose} style={styles.iconCircle}>
          <Ionicons name="close" size={26} color={Colors.white} />
        </TouchableOpacity>

        {/* Recording Timer Badge */}
        {isRecording ? (
          <View style={styles.timerBadge}>
            <View style={styles.recordingDot} />
            <Text style={styles.timerText}>{formatTimer(recordSeconds)} / 01:00</Text>
          </View>
        ) : (
          <View style={styles.soundPill}>
            <Ionicons name="musical-notes" size={14} color={Colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.soundPillText}>Add Sound</Text>
          </View>
        )}

        <View style={styles.topRightActions}>
          <TouchableOpacity onPress={toggleTorch} style={styles.topActionBtn}>
            <Ionicons
              name={torch ? 'flash' : 'flash-off'}
              size={22}
              color={torch ? Colors.secondary : Colors.white}
            />
            <Text style={styles.actionLabel}>Flash</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleFacing} style={styles.topActionBtn}>
            <MaterialIcons name="flip-camera-ios" size={22} color={Colors.white} />
            <Text style={styles.actionLabel}>Flip</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={[styles.bottomControls, { bottom: insets.bottom + 20 }]}>
        {/* Effects / Filters */}
        <TouchableOpacity style={styles.sideControl}>
          <Feather name="smile" size={28} color={Colors.white} />
          <Text style={styles.sideControlText}>Effects</Text>
        </TouchableOpacity>

        {/* Record Button */}
        <TouchableOpacity
          style={[styles.recordButtonOuter, isRecording && styles.recordingOuter]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <View style={[styles.recordButtonInner, isRecording && styles.recordingInner]} />
        </TouchableOpacity>

        {/* Upload from Gallery */}
        <TouchableOpacity style={styles.sideControl} onPress={pickFromGallery}>
          <Ionicons name="images-outline" size={28} color={Colors.white} />
          <Text style={styles.sideControlText}>Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  closeBtnCorner: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
  },
  permissionTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionSub: {
    color: Colors.gray,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  grantButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  grantButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  galleryFallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  galleryFallbackText: {
    color: Colors.white,
    fontSize: 15,
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  timerText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  soundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  soundPillText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  topRightActions: {
    alignItems: 'center',
  },
  topActionBtn: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionLabel: {
    color: Colors.white,
    fontSize: 11,
    marginTop: 4,
  },
  bottomControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  recordButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  recordingOuter: {
    borderColor: Colors.primary,
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
  },
  recordingInner: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  sideControl: {
    alignItems: 'center',
    width: 60,
  },
  sideControlText: {
    color: Colors.white,
    fontSize: 12,
    marginTop: 6,
  },
});
