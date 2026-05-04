import React, { useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from './Typography';

interface Props {
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentStyle?: ViewStyle;
  children: React.ReactNode;
  /** Optional accent color for header gradient line */
  accentColor?: string;
}

export function AnimatedScreenScaffold({
  title,
  subtitle,
  scroll = true,
  refreshControl,
  contentStyle,
  children,
  accentColor,
}: Props) {
  const theme = useTheme();

  // Header entrance animation
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-15);

  useEffect(() => {
    headerOpacity.value = withDelay(50, withTiming(1, { duration: 400 }));
    headerTranslateY.value = withDelay(
      50,
      withSpring(0, { damping: 20, stiffness: 200, mass: 0.5 })
    );
  }, []);

  const headerAnimStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[
        { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl + 30 },
        contentStyle,
      ]}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding: theme.spacing.lg }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      {title ? (
        <Animated.View
          style={[
            {
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.md,
              paddingBottom: theme.spacing.sm,
            },
            headerAnimStyle,
          ]}
        >
          {/* Accent gradient line */}
          <View
            style={{
              width: 40,
              height: 3,
              borderRadius: 2,
              backgroundColor: accentColor ?? theme.raw.rose,
              marginBottom: 10,
              opacity: 0.8,
            }}
          />
          <Typography variant="h1">{title}</Typography>
          {subtitle ? (
            <Typography
              variant="bodySmall"
              color={theme.colors.textSecondary}
              style={{ marginTop: 4 }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Animated.View>
      ) : null}
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
