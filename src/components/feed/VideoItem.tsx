import React, { useState } from 'react';
import { View, StyleSheet, Share } from 'react-native';
import { VideoItemModel } from '../../types/database';
import { VideoPlayer } from './VideoPlayer';
import { VideoOverlay } from './VideoOverlay';
import { LikeAnimation } from './LikeAnimation';

interface VideoItemProps {
  video: VideoItemModel;
  isActive: boolean;
  itemHeight: number;
  onLikeToggle: (videoId: string) => void;
  onCommentPress?: (video: VideoItemModel) => void;
  onProfilePress?: (userId: string) => void;
}

interface HeartEffect {
  id: number;
  x?: number;
  y?: number;
}

export const VideoItem: React.FC<VideoItemProps> = ({
  video,
  isActive,
  itemHeight,
  onLikeToggle,
  onCommentPress,
  onProfilePress,
}) => {
  const [hearts, setHearts] = useState<HeartEffect[]>([]);

  const handleDoubleTap = (x: number, y: number) => {
    // Trigger like if not already liked
    if (!video.is_liked) {
      onLikeToggle(video.id);
    }
    // Spawn heart animation at tap position
    setHearts((prev) => [...prev, { id: Date.now() + Math.random(), x, y }]);
  };

  const removeHeart = (id: number) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Watch this TikTok by @${video.profile?.username || 'creator'}: ${video.caption || ''}`,
        url: video.video_url,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <View style={[styles.container, { height: itemHeight }]}>
      {/* Video Content */}
      <VideoPlayer
        videoUrl={video.video_url}
        isActive={isActive}
        onDoubleTap={handleDoubleTap}
      />

      {/* Heart Animations */}
      {hearts.map((heart) => (
        <LikeAnimation
          key={heart.id}
          x={heart.x}
          y={heart.y}
          onComplete={() => removeHeart(heart.id)}
        />
      ))}

      {/* Floating TikTok Overlays */}
      <VideoOverlay
        video={video}
        onLikePress={() => onLikeToggle(video.id)}
        onCommentPress={() => onCommentPress?.(video)}
        onSharePress={handleShare}
        onProfilePress={() => onProfilePress?.(video.user_id)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
});
