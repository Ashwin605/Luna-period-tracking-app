import React, { useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../hooks/useTheme';

interface Props {
  children: React.ReactNode;
  padding?: number;
  elevated?: boolean;
  style?: ViewStyle;
  /** Index for staggered entrance animation */
  index?: number;
  /** Entry animation variant */
  entrance?: 'fade-up' | 'fade-down' | 'slide-right' | 'scale' | 'none';
  /** Whether to add press scale animation */
  pressable?: boolean;
  /** Optional glow color for accent border */
  glowColor?: string;
}

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 200,
  mass: 0.6,
};

export function AnimatedCard({
  children,
  padding,
  elevated,
  style,
  index = 0,
  entrance = 'fade-up',
  pressable = false,
  glowColor,
}: Props) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(entrance === 'fade-up' ? 30 : entrance === 'fade-down' ? -30 : 0);

  useEffect(() => {
    const delay = index * 80;
    opacity.value = withDelay(delay, withTiming(1, { duration: 450 }));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const cardStyle: ViewStyle = {
    backgroundColor: elevated
      ? theme.colors.surfaceElevated
      : theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: padding ?? theme.spacing.lg,
    borderWidth: 1,
    borderColor: glowColor
      ? glowColor + '40'
      : theme.colors.border,
    // Subtle shadow for depth
    ...(elevated || glowColor
      ? {
          shadowColor: glowColor ?? theme.raw.rose,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }),
  };

  return (
    <Animated.View
      style={[styles.base, cardStyle, animatedStyle, style]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
