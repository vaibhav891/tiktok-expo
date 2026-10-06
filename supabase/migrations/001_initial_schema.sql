-- ============================================================================
-- TikTok Clone Database Schema & Row Level Security (Supabase)
-- ============================================================================

-- 1. PROFILES TABLE
-- Automatically populated upon user registration (Google OAuth / Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  followers_count integer default 0,
  following_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. VIDEOS TABLE
-- Publicly readable by anyone (no login required for feed viewing)
-- Insert requires authenticated user
create table if not exists public.videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  video_url text not null,
  thumbnail_url text,
  caption text,
  song_title text default 'Original Sound - TikTok',
  likes_count integer default 0,
  comments_count integer default 0,
  shares_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. LIKES TABLE
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  video_id uuid references public.videos(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, video_id)
);

-- 4. COMMENTS TABLE
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  video_id uuid references public.videos(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- PROFILES POLICIES
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- VIDEOS POLICIES
-- Anyone (authenticated or anonymous) can view videos (FEED VIEWING)
create policy "Videos are viewable by everyone"
  on public.videos for select
  using (true);

-- Only authenticated users can post videos
create policy "Authenticated users can post videos"
  on public.videos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own videos"
  on public.videos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own videos"
  on public.videos for delete
  using (auth.uid() = user_id);

-- LIKES POLICIES
create policy "Likes are viewable by everyone"
  on public.likes for select
  using (true);

create policy "Authenticated users can like videos"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike videos"
  on public.likes for delete
  using (auth.uid() = user_id);

-- COMMENTS POLICIES
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Authenticated users can post comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- AUTOMATED TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to handle new user registration from auth.users
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_user_name text;
  display_name text;
  avatar_url text;
begin
  raw_user_name := coalesce(
    new.raw_user_meta_data->>'user_name',
    split_part(new.email, '@', 1)
  );
  display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
  avatar_url := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    raw_user_name || '_' || substr(new.id::text, 1, 4),
    display_name,
    avatar_url
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile when auth.users record is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for like counts
create or replace function public.handle_like_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.videos
    set likes_count = likes_count + 1
    where id = new.video_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.videos
    set likes_count = greatest(0, likes_count - 1)
    where id = old.video_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_like_change on public.likes;
create trigger on_like_change
  after insert or delete on public.likes
  for each row execute procedure public.handle_like_count();

-- Trigger for comment counts
create or replace function public.handle_comment_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.videos
    set comments_count = comments_count + 1
    where id = new.video_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.videos
    set comments_count = greatest(0, comments_count - 1)
    where id = old.video_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_comment_change on public.comments;
create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute procedure public.handle_comment_count();

-- ============================================================================
-- STORAGE BUCKETS (VIDEOS & THUMBNAILS)
-- ============================================================================

-- Create storage buckets if they do not exist
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Storage policies: Public read for videos and thumbnails
create policy "Public video access"
  on storage.objects for select
  using (bucket_id in ('videos', 'thumbnails', 'avatars'));

-- Authenticated users can upload to videos bucket
create policy "Authenticated users can upload videos"
  on storage.objects for insert
  with check (
    bucket_id in ('videos', 'thumbnails', 'avatars')
    and auth.role() = 'authenticated'
  );

create policy "Users can delete their own uploaded objects"
  on storage.objects for delete
  using (
    bucket_id in ('videos', 'thumbnails', 'avatars')
    and auth.uid() = owner
  );
