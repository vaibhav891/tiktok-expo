import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Header } from '../../src/components/common/Header';
import { VideoFeed } from '../../src/components/feed/VideoFeed';
import { useFeedVideos } from '../../src/hooks/useFeedVideos';
import { Colors } from '../../src/constants/colors';
import { VideoItemModel } from '../../src/types/database';

export default function FeedScreen() {
  const { videos, isLoading, isRefreshing, refreshFeed, toggleLike } = useFeedVideos();

  const handleSearchPress = () => {
    Alert.alert('Search', 'Explore trending creators, hashtags, and sounds.');
  };

  const handleCommentPress = (video: VideoItemModel) => {
    Alert.alert(
      'Comments',
      `Viewing comments on video by @${video.profile?.username || 'creator'}`
    );
  };

  const handleProfilePress = (userId: string) => {
    // Can navigate to creator's public profile
  };

  return (
    <View style={styles.container}>
      {/* Top Floating Following / For You Header */}
      <Header onSearchPress={handleSearchPress} />

      {/* Vertical Snapping Video Feed */}
      <VideoFeed
        videos={videos}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={refreshFeed}
        onLikeToggle={toggleLike}
        onCommentPress={handleCommentPress}
        onProfilePress={handleProfilePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
});
