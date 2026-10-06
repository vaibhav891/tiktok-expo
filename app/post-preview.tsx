import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors } from '../src/constants/colors';
import { useAuth } from '../src/hooks/useAuth';
import { videoService } from '../src/services/videoService';

export default function PostPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { videoUri } = useLocalSearchParams<{ videoUri: string }>();

  const [caption, setCaption] = useState('');
  const [songTitle, setSongTitle] = useState('Original Sound - TikTok');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const player = useVideoPlayer(videoUri || '', (p) => {
    p.loop = true;
    p.play();
  });

  const popularTags = ['#fyp', '#trending', '#viral', '#foryou', '#explore'];

  const addTag = (tag: string) => {
    setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handlePost = async () => {
    if (!videoUri) {
      Alert.alert('Error', 'No video found to post.');
      return;
    }

    if (!user) {
      Alert.alert('Login Required', 'You must be logged in to post videos.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress('Uploading video to Supabase Storage...');

      const uploadedUrl = await videoService.uploadVideo(videoUri, user.id);

      setUploadProgress('Creating video post in Supabase...');
      await videoService.createVideoPost({
        userId: user.id,
        videoUrl: uploadedUrl,
        caption: caption.trim(),
        songTitle: songTitle.trim(),
      });

      Alert.alert('Success 🎉', 'Your video has been posted!', [
        {
          text: 'View Feed',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (err: any) {
      console.error('Post creation error:', err);
      Alert.alert('Post Failed', err.message || 'Could not upload video.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Video</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Preview & Caption Row */}
        <View style={styles.previewRow}>
          <View style={styles.videoThumbnailBox}>
            {Boolean(videoUri) && (
              <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                nativeControls={false}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.captionInput}
              placeholder="Describe your video, add hashtags..."
              placeholderTextColor={Colors.gray}
              multiline
              maxLength={300}
              value={caption}
              onChangeText={setCaption}
            />
            <Text style={styles.charCount}>{caption.length}/300</Text>
          </View>
        </View>

        {/* Popular Tags */}
        <View style={styles.tagSection}>
          <Text style={styles.tagLabel}>Suggested Hashtags</Text>
          <View style={styles.tagRow}>
            {popularTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tagPill}
                onPress={() => addTag(tag)}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Audio Sound Title */}
        <View style={styles.soundSection}>
          <View style={styles.soundHeader}>
            <Ionicons name="musical-notes" size={18} color={Colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.soundLabel}>Sound Track</Text>
          </View>
          <TextInput
            style={styles.soundInput}
            value={songTitle}
            onChangeText={setSongTitle}
            placeholder="Sound name"
            placeholderTextColor={Colors.gray}
          />
        </View>

        {/* Privacy Info */}
        <View style={styles.privacyBox}>
          <Feather name="globe" size={18} color={Colors.gray} style={{ marginRight: 10 }} />
          <Text style={styles.privacyText}>
            Public: Anyone on the TikTok feed can view and share your video.
          </Text>
        </View>
      </ScrollView>

      {/* Post Action Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {isUploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 10 }} />
            <Text style={styles.uploadingText}>{uploadProgress}</Text>
          </View>
        ) : (
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.draftButton} onPress={() => router.back()}>
              <Text style={styles.draftText}>Discard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postButton} onPress={handlePost}>
              <Text style={styles.postText}>Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  previewRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  videoThumbnailBox: {
    width: 100,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.black,
    marginRight: 12,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  captionInput: {
    color: Colors.white,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    color: Colors.gray,
    fontSize: 12,
    textAlign: 'right',
  },
  tagSection: {
    marginBottom: 24,
  },
  tagLabel: {
    color: Colors.gray,
    fontSize: 13,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPill: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    color: Colors.white,
    fontSize: 13,
  },
  soundSection: {
    marginBottom: 24,
  },
  soundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  soundLabel: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  soundInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkGray,
    padding: 12,
    borderRadius: 8,
  },
  privacyText: {
    color: Colors.gray,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  uploadingText: {
    color: Colors.white,
    fontSize: 14,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  draftButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginRight: 8,
  },
  draftText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  postButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  postText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
