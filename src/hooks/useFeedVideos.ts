import { useState, useEffect, useCallback } from 'react';
import { VideoItemModel } from '../types/database';
import { videoService } from '../services/videoService';
import { useAuth } from './useAuth';

export const useFeedVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoItemModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadVideos = useCallback(async () => {
    try {
      const items = await videoService.getFeedVideos(user?.id);
      setVideos(items);
    } catch (err) {
      console.warn('Failed to load feed videos:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const refreshFeed = async () => {
    setIsRefreshing(true);
    await loadVideos();
  };

  const toggleLike = async (videoId: string) => {
    const target = videos.find((v) => v.id === videoId);
    if (!target || !user) return;

    const currentLiked = Boolean(target.is_liked);
    const newLiked = !currentLiked;
    const countDelta = newLiked ? 1 : -1;

    // Optimistic local UI update
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              is_liked: newLiked,
              likes_count: Math.max(0, v.likes_count + countDelta),
            }
          : v
      )
    );

    // Asynchronous backend sync
    try {
      await videoService.toggleLike(videoId, user.id, currentLiked);
    } catch (err) {
      console.warn('Failed to sync like status:', err);
      // Revert on failure
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                is_liked: currentLiked,
                likes_count: Math.max(0, v.likes_count - countDelta),
              }
            : v
        )
      );
    }
  };

  const addVideoToFeed = (newVideo: VideoItemModel) => {
    setVideos((prev) => [newVideo, ...prev]);
  };

  return {
    videos,
    isLoading,
    isRefreshing,
    refreshFeed,
    toggleLike,
    addVideoToFeed,
  };
};
