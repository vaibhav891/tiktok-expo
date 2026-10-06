import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  GestureResponderEvent,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface VideoPlayerProps {
  videoUrl: string;
  isActive: boolean;
  onDoubleTap?: (x: number, y: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  isActive,
  onDoubleTap,
}) => {
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const lastTapRef = useRef<number>(0);

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    if (isActive) {
      p.play();
    }
  });

  useEffect(() => {
    if (isActive) {
      player.play();
      setIsPlaying(true);
      setShowPlayIcon(false);
    } else {
      player.pause();
      setIsPlaying(false);
      setShowPlayIcon(false);
    }
  }, [isActive, player]);

  const handlePress = (e: GestureResponderEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      const { locationX, locationY } = e.nativeEvent;
      onDoubleTap?.(locationX, locationY);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now) {
          // Single tap: toggle play / pause
          if (player.playing) {
            player.pause();
            setIsPlaying(false);
            setShowPlayIcon(true);
          } else {
            player.play();
            setIsPlaying(true);
            setShowPlayIcon(false);
          }
        }
      }, DOUBLE_PRESS_DELAY);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />

        {/* Center Play Icon when paused by user */}
        {showPlayIcon && !isPlaying && (
          <View style={styles.playIconContainer} pointerEvents="none">
            <View style={styles.playIconCircle}>
              <Ionicons name="play" size={44} color="rgba(255, 255, 255, 0.85)" style={{ marginLeft: 4 }} />
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
