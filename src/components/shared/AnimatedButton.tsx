import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Pressable,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

import { useTheme } from '../../hooks/useTheme';
import { HapticEngine } from '../../utils/haptics';
import { Typography } from './Typography';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  leadingIcon?: React.ReactNode;
  onPress?: () => void;
}

const SPRING = { damping: 15, stiffness: 400, mass: 0.5 };

export function AnimatedButton({
  label,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth,
  style,
  leadingIcon,
  onPress,
}: Props) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const heightMap: Record<Size, number> = { sm: 40, md: 52, lg: 60 };
  const horizontalPad: Record<Size, number> = {
    sm: theme.spacing.md,
    md: theme.spacing.lg,
    lg: theme.spacing.xl,
  };

  const bg =
    variant === 'primary'
      ? theme.raw.rose
      : variant === 'destructive'
      ? theme.raw.error
      : variant === 'secondary'
      ? theme.colors.surfaceElevated
      : 'transparent';

  const fg =
    variant === 'primary' || variant === 'destructive'
      ? theme.raw.white
      : theme.colors.textPrimary;

  const borderColor =
    variant === 'secondary' ? theme.colors.border : 'transparent';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, SPRING);
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.02, SPRING),
      withSpring(1, SPRING)
    );
  };

  const handlePress = () => {
    HapticEngine.impact();
    onPress?.();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[style, { opacity: disabled ? 0.4 : 1 }]}
    >
      <Animated.View
        style={[
          styles.base,
          {
            backgroundColor: bg,
            height: heightMap[size],
            paddingHorizontal: horizontalPad[size],
            borderRadius: theme.radius.xl,
            borderWidth: variant === 'secondary' ? 1 : 0,
            borderColor,
            width: fullWidth ? '100%' : undefined,
            // Premium shadow
            shadowColor: variant === 'primary' ? theme.raw.rose : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: variant === 'primary' ? 0.3 : 0.08,
            shadowRadius: variant === 'primary' ? 12 : 6,
            elevation: variant === 'primary' ? 6 : 2,
          },
          animatedStyle,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <View style={styles.content}>
            {leadingIcon ? (
              <View style={{ marginRight: theme.spacing.sm }}>
                {leadingIcon}
              </View>
            ) : null}
            <Typography
              variant="body"
              color={fg}
              weight="600"
              style={{ letterSpacing: 0.3 }}
            >
              {label}
            </Typography>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
