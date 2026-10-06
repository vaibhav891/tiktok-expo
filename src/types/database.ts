export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  created_at: string;
}

export interface VideoItemModel {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url?: string;
  caption?: string;
  song_title?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  profile?: Profile;
  is_liked?: boolean;
}

export interface CommentItemModel {
  id: string;
  user_id: string;
  video_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
}
