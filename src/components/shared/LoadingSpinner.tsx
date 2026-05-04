import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

import { useTheme } from '../../hooks/useTheme';
import { Typography } from './Typography';

interface Props { label?: string; fullscreen?: boolean; }

export function LoadingSpinner({ label, fullscreen }: Props) {
  const theme = useTheme();
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    rotate.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1, false);
    scale.value = withRepeat(withSequence(withTiming(1, { duration: 800 }), withTiming(0.8, { duration: 800 })), -1, true);
    opacity.value = withRepeat(withSequence(withTiming(1, { duration: 800 }), withTiming(0.4, { duration: 800 })), -1, true);
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.base, fullscreen ? { flex: 1, backgroundColor: theme.colors.background } : null]}>
      <Animated.View style={[{ width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: theme.raw.rose, borderTopColor: 'transparent' }, spinStyle]} />
      {label ? (
        <Typography variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.md }}>{label}</Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', padding: 24 },
});
