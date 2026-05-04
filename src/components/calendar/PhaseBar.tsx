import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../shared/Typography';

interface Phase {
  label: string;
  color: string;
}

const PHASES: Phase[] = [
  { label: 'Menstrual', color: '#E8637A' },
  { label: 'Follicular', color: '#9FE1CB' },
  { label: 'Ovulatory', color: '#1D9E75' },
  { label: 'Luteal', color: '#AFA9EC' },
  { label: 'Predicted', color: '#F5C0C9' },
];

export function PhaseBar() {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {PHASES.map(p => (
        <View key={p.label} style={styles.item}>
          <View
            style={[
              styles.dot,
              { backgroundColor: p.color, marginRight: theme.spacing.xs },
            ]}
          />
          <Typography variant="caption" color={theme.colors.textSecondary}>
            {p.label}
          </Typography>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
