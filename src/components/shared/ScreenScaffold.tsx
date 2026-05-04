import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { Typography } from './Typography';

interface Props {
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentStyle?: ViewStyle;
  children: React.ReactNode;
}

export function ScreenScaffold({
  title,
  subtitle,
  scroll = true,
  refreshControl,
  contentStyle,
  children,
}: Props) {
  const theme = useTheme();

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[
        { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
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
        <View
          style={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
          }}
        >
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
        </View>
      ) : null}
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
