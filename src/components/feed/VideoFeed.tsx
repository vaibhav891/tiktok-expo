import React, { useState, useRef, useCallback } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  useWindowDimensions,
  ViewToken,
  ActivityIndicator,
  RefreshControl,
  Text,
} from 'react-native';
import { VideoItemModel } from '../../types/database';
import { VideoItem } from './VideoItem';
import { Colors } from '../../constants/colors';

interface VideoFeedProps {
  videos: VideoItemModel[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLikeToggle: (videoId: string) => void;
  onCommentPress?: (video: VideoItemModel) => void;
  onProfilePress?: (userId: string) => void;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  videos,
  isLoading,
  isRefreshing,
  onRefresh,
  onLikeToggle,
  onCommentPress,
  onProfilePress,
}) => {
  const { height: windowHeight } = useWindowDimensions();

  const TAB_BAR_HEIGHT = 60;
  const itemHeight = windowHeight - TAB_BAR_HEIGHT;
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems && viewableItems.length > 0) {
        const firstVisible = viewableItems[0];
        if (firstVisible.index !== null && firstVisible.index !== undefined) {
          setActiveVideoIndex(firstVisible.index);
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: VideoItemModel; index: number }) => {
      const isActive = index === activeVideoIndex;
      return (
        <VideoItem
          video={item}
          isActive={isActive}
          itemHeight={itemHeight}
          onLikeToggle={onLikeToggle}
          onCommentPress={onCommentPress}
          onProfilePress={onProfilePress}
        />
      );
    },
    [activeVideoIndex, itemHeight, onLikeToggle, onCommentPress, onProfilePress]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight]
  );

  if (isLoading && videos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={1}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.gray,
    marginTop: 12,
    fontSize: 14,
  },
});
