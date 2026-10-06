import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface LikeAnimationProps {
  onComplete: () => void;
  x?: number;
  y?: number;
}

export const LikeAnimation: React.FC<LikeAnimationProps> = ({ onComplete, x, y }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Random slight rotation for organic feel (-15 deg to +15 deg)
    const randomRotate = Math.random() > 0.5 ? 1 : -1;

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.2,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: randomRotate,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.6,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete();
    });
  }, []);

  const spin = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <View
      style={[
        styles.container,
        x !== undefined && y !== undefined ? { left: x - 50, top: y - 50 } : styles.centered,
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={{
          transform: [{ scale }, { rotate: spin }],
          opacity,
        }}
      >
        <AntDesign name="heart" size={100} color={Colors.primary} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
  centered: {
    alignSelf: 'center',
    top: '40%',
  },
});
