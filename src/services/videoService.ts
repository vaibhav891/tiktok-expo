import { supabase, isSupabaseConfigured } from './supabase';
import { VideoItemModel } from '../types/database';
import { MOCK_VIDEOS } from '../constants/mockVideos';

export const videoService = {
  /**
   * Fetches public videos for the feed.
   * No login required.
   */
  async getFeedVideos(currentUserId?: string): Promise<VideoItemModel[]> {
    if (!isSupabaseConfigured()) {
      return MOCK_VIDEOS;
    }

    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id,
          user_id,
          video_url,
          thumbnail_url,
          caption,
          song_title,
          likes_count,
          comments_count,
          shares_count,
          created_at,
          profile:profiles (
            id,
            username,
            display_name,
            avatar_url,
            followers_count,
            following_count,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) {
        console.warn('Supabase fetch failed or empty, falling back to mock feed:', error?.message);
        return MOCK_VIDEOS;
      }

      // Check if current user liked any of these videos
      let userLikedVideoIds = new Set<string>();
      if (currentUserId) {
        const { data: likesData } = await supabase
          .from('likes')
          .select('video_id')
          .eq('user_id', currentUserId);
        if (likesData) {
          userLikedVideoIds = new Set(likesData.map((l) => l.video_id));
        }
      }

      return data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        video_url: item.video_url,
        thumbnail_url: item.thumbnail_url,
        caption: item.caption,
        song_title: item.song_title || 'Original Sound - TikTok',
        likes_count: item.likes_count ?? 0,
        comments_count: item.comments_count ?? 0,
        shares_count: item.shares_count ?? 0,
        created_at: item.created_at,
        profile: Array.isArray(item.profile) ? item.profile[0] : item.profile,
        is_liked: userLikedVideoIds.has(item.id),
      }));
    } catch (err) {
      console.warn('Error fetching feed videos:', err);
      return MOCK_VIDEOS;
    }
  },

  /**
   * Toggles like status on a video. Requires authentication.
   */
  async toggleLike(videoId: string, userId: string, currentlyLiked: boolean): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return !currentlyLiked;
    }

    if (currentlyLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('video_id', videoId)
        .eq('user_id', userId);
      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ video_id: videoId, user_id: userId });
      if (error) throw error;
      return true;
    }
  },

  /**
   * Uploads local video file URI to Supabase Storage.
   * Requires authentication.
   */
  async uploadVideo(localUri: string, userId: string): Promise<string> {
    if (!isSupabaseConfigured()) {
      // In mock/offline mode, return sample video URL
      return 'https://res.cloudinary.com/demo/video/upload/q_auto,w_720/dog.mp4';
    }

    const response = await fetch(localUri);
    const blob = await response.blob();
    const fileExt = localUri.split('.').pop() || 'mp4';
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, blob, {
        contentType: `video/${fileExt === 'mov' ? 'quicktime' : 'mp4'}`,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('videos').getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Posts video metadata to public.videos table.
   * Requires authentication.
   */
  async createVideoPost(params: {
    userId: string;
    videoUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    songTitle?: string;
  }): Promise<VideoItemModel> {
    if (!isSupabaseConfigured()) {
      return {
        id: `mock-created-${Date.now()}`,
        user_id: params.userId,
        video_url: params.videoUrl,
        thumbnail_url: params.thumbnailUrl,
        caption: params.caption,
        song_title: params.songTitle || 'Original Sound - TikTok',
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        created_at: new Date().toISOString(),
        is_liked: false,
      };
    }

    const { data, error } = await supabase
      .from('videos')
      .insert({
        user_id: params.userId,
        video_url: params.videoUrl,
        thumbnail_url: params.thumbnailUrl,
        caption: params.caption,
        song_title: params.songTitle || 'Original Sound - TikTok',
      })
      .select(`
        *,
        profile:profiles (*)
      `)
      .single();

    if (error) throw error;
    return data;
  },
};
