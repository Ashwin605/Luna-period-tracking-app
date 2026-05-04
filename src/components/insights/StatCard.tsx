import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimatedCard } from '../shared/AnimatedCard';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../shared/Typography';

interface Props {
  label: string;
  value: string;
  caption?: string;
  accentColor?: string;
  index?: number;
}

export function StatCard({ label, value, caption, accentColor, index = 0 }: Props) {
  const theme = useTheme();
  return (
    <AnimatedCard padding={theme.spacing.md} style={styles.card} index={index} glowColor={accentColor}>
      <View style={[styles.accent, { backgroundColor: accentColor ?? theme.raw.rose, borderTopLeftRadius: theme.radius.lg, borderBottomLeftRadius: theme.radius.lg }]} />
      <Typography variant="label" color={theme.colors.textSecondary}>{label.toUpperCase()}</Typography>
      <Typography variant="h2" style={{ marginTop: 4 }}>{value}</Typography>
      {caption ? (<Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>{caption}</Typography>) : null}
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  card: { flexBasis: '48%', flexGrow: 1, overflow: 'hidden' },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
});
