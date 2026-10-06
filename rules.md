# Project Rules & Architecture Guidelines: TikTok Expo Clone

This document serves as the persistent architectural, technical, and security guidelines for developing, scaling, and maintaining the TikTok React Native (Expo) social video application.

---

## 1. Core Principles & Requirements

- **Feed Viewing Without Authentication**:
  - The public video feed must ALWAYS be accessible without requiring users to log in or create an account.
  - Video streams, audio playback, creator profiles, and comments can be viewed freely by unauthenticated guests.
- **Protected Actions (Authentication Required)**:
  - Any mutating action requires authentication:
    1. Uploading / posting a video.
    2. Live in-app camera recording for posting.
    3. Liking a video.
    4. Commenting on a video.
    5. Editing profile information.
  - When an unauthenticated user attempts these actions, display `AuthModal` triggering the Google Sign-In flow rather than crashing or abruptly rejecting them.
- **Google Sign-In**:
  - Google is the primary authentication provider via Supabase Auth.
  - OAuth redirects must follow `expo-auth-session` conventions (`makeRedirectUri`).

---

## 2. Directory Structure Conventions

```
tiktok-expo/
├── app/                          # Expo Router file-based routes
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── _layout.tsx           # Tab bar with custom TikTok dark styling
│   │   ├── index.tsx             # Home feed (vertical snapping video player)
│   │   ├── camera.tsx            # In-app camera recording & gallery picker (Protected)
│   │   └── profile.tsx           # User profile & account management
│   ├── post-preview.tsx          # Upload review, caption & tags input (Protected)
│   └── _layout.tsx               # Root provider wrapper (Auth, Theme, SafeArea)
├── src/
│   ├── components/
│   │   ├── feed/                 # Video feed, overlays, heart animation
│   │   ├── camera/               # Live camera view, record timer, flash/flip controls
│   │   └── common/               # AuthModal, Header, Avatar, Buttons
│   ├── hooks/                    # Custom React hooks (useAuth, useFeedVideos, useVideoUpload)
│   ├── services/                 # Supabase client, storage uploads, database queries
│   ├── constants/                # Colors, dimensions, mock video seeds
│   └── types/                    # Database, user, and feed TypeScript interfaces
├── supabase/
│   └── migrations/               # PostgreSQL DDL, RLS policies, and triggers
└── rules.md                      # This specification file
```

---

## 3. Backend & Row Level Security (RLS) Rules

All database tables in Supabase MUST have Row Level Security enabled. Never bypass RLS in client code.

### RLS Policies Summary

| Table | Operation | Role | Policy Rule | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `videos` | `SELECT` | `anon`, `authenticated` | `USING (true)` | **Public Feed**: Anyone can stream videos |
| `videos` | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = user_id)` | **Login Required**: Only logged-in users can post |
| `videos` | `UPDATE/DELETE`| `authenticated` | `USING (auth.uid() = user_id)` | Creator only |
| `likes` | `SELECT` | `anon`, `authenticated` | `USING (true)` | Visible like counters |
| `likes` | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = user_id)` | Authenticated likes only |
| `comments` | `SELECT` | `anon`, `authenticated` | `USING (true)` | Visible comments |
| `comments` | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = user_id)` | Authenticated comments only |
| `storage.objects` | `SELECT` | `public` | `bucket_id IN ('videos', 'thumbnails')` | Public video/cover streaming |
| `storage.objects` | `INSERT` | `authenticated` | `auth.role() = 'authenticated'` | Authenticated uploads |

---

## 4. Video Feed Performance Guidelines

Vertical video feeds can easily cause memory leaks and frame drops if unmanaged. Adhere to these rules:

1. **Single Active Video Player Rule**:
   - Only the item currently in the primary viewport should have active playback.
   - Use `onViewableItemsChanged` with a viewability threshold $\ge 80\%$.
   - When an item leaves the viewport, immediately pause/unload playback to release hardware decoders and stop audio.
2. **Snapping & Layout**:
   - Always set `snapToInterval={SCREEN_HEIGHT}` and `decelerationRate="fast"`.
   - Set `pagingEnabled={true}` for consistent full-screen snapping.
   - Use `getItemLayout` where possible to skip dynamic measurement overhead.
3. **FlatList Virtualization**:
   - Keep `windowSize` small (typically `3` to `5`) to render at most 1 item above and 1 item below the current video.
   - Set `maxToRenderPerBatch={2}` and `initialNumToRender={1}`.
   - Enable `removeClippedSubviews={true}` on Android.
4. **Optimistic Updates**:
   - Tapping Like must immediately update the UI state and trigger the heart animation. Sync the Supabase mutation asynchronously in the background.

---

## 5. Coding & TypeScript Standards

- **Strict Typing**: All components, props, hooks, and service responses must have explicit TypeScript types. Avoid `any`.
- **Component Separation**:
  - Keep presentation components pure (`VideoOverlay`, `LikeAnimation`).
  - Move asynchronous data logic into custom hooks (`useFeedVideos`, `useVideoUpload`).
- **Dark Theme Consistency**:
  - Background is always pure black (`#000000`) for video immersion.
  - Accent colors: TikTok Pink/Red (`#FE2C55`) and TikTok Cyan (`#25F4EE`).
- **Safe Area Insets**:
  - Use `react-native-safe-area-context` (`useSafeAreaInsets`) to avoid overlapping status bar notches and home indicator pills.

---

## 6. Google Sign-In Setup Checklist

When connecting a new Supabase project:
1. In Google Cloud Console:
   - Create an OAuth 2.0 Client ID (Web Application).
   - Add Supabase's redirect URI: `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`.
2. In Supabase Dashboard:
   - Go to **Authentication** $\to$ **Providers** $\to$ **Google**.
   - Enable Google and enter `Client ID` and `Client Secret`.
3. In the React Native App:
   - Configure deep linking scheme in `app.json` (`scheme: "tiktokexpo"`).
   - Configure `.env`:
     ```env
     EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
     ```
