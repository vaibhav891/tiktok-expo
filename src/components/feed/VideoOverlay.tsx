import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { AntDesign, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoItemModel } from '../../types/database';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

interface VideoOverlayProps {
  video: VideoItemModel;
  onLikePress: () => void;
  onCommentPress: () => void;
  onSharePress: () => void;
  onProfilePress: () => void;
}

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const VideoOverlay: React.FC<VideoOverlayProps> = ({
  video,
  onLikePress,
  onCommentPress,
  onSharePress,
  onProfilePress,
}) => {
  const { user, openAuthModal } = useAuth();
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuously rotating vinyl disc animation
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLike = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    onLikePress();
  };

  const handleComment = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    onCommentPress();
  };

  const profile = video.profile;
  const avatarUrl =
    profile?.avatar_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
  const username = profile?.username || 'creator';

  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      {/* Bottom Info Section */}
      <View style={styles.bottomSection} pointerEvents="box-none">
        <TouchableOpacity onPress={onProfilePress}>
          <Text style={styles.username}>@{username}</Text>
        </TouchableOpacity>

        {Boolean(video.caption) && (
          <Text style={styles.caption} numberOfLines={3}>
            {video.caption}
          </Text>
        )}

        {/* Music Sound Ticker */}
        <View style={styles.musicRow}>
          <Ionicons name="musical-notes" size={15} color={Colors.white} style={styles.musicIcon} />
          <Text style={styles.musicText} numberOfLines={1}>
            {video.song_title || 'Original Sound - TikTok'}
          </Text>
        </View>
      </View>

      {/* Right-Hand Action Bar */}
      <View style={styles.rightActions}>
        {/* Creator Avatar with Follow Button */}
        <TouchableOpacity style={styles.avatarContainer} onPress={onProfilePress}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <View style={styles.followBadge}>
            <AntDesign name="plus" size={12} color={Colors.white} />
          </View>
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
          <Ionicons
            name={video.is_liked ? 'heart' : 'heart-outline'}
            size={34}
            color={video.is_liked ? Colors.primary : Colors.white}
          />
          <Text style={styles.actionText}>{formatCount(video.likes_count)}</Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity style={styles.actionItem} onPress={handleComment}>
          <Ionicons name="chatbubble-ellipses" size={32} color={Colors.white} />
          <Text style={styles.actionText}>{formatCount(video.comments_count)}</Text>
        </TouchableOpacity>

        {/* Bookmark / Save Button */}
        <TouchableOpacity style={styles.actionItem}>
          <FontAwesome name="bookmark" size={30} color={Colors.white} />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.actionItem} onPress={onSharePress}>
          <MaterialCommunityIcons name="share" size={34} color={Colors.white} />
          <Text style={styles.actionText}>{formatCount(video.shares_count)}</Text>
        </TouchableOpacity>

        {/* Rotating Vinyl Record */}
        <Animated.View style={[styles.discContainer, { transform: [{ rotate: spin }] }]}>
          <View style={styles.discInner}>
            <Image source={{ uri: avatarUrl }} style={styles.discImage} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    marginRight: 16,
    marginBottom: 4,
  },
  username: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicIcon: {
    marginRight: 8,
  },
  musicText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  rightActions: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  avatarContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  followBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  discContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: '#111111',
    marginTop: 8,
  },
  discInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  discImage: {
    width: '100%',
    height: '100%',
  },
});
