import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import type { EnergyScore } from '../../types/cycle';
import { Typography } from '../shared/Typography';

interface Props {
  value: EnergyScore;
  onChange: (value: EnergyScore) => void;
}

const LABELS: Record<EnergyScore, string> = {
  1: 'Drained',
  2: 'Low',
  3: 'Steady',
  4: 'Energized',
  5: 'Peak',
};

export function EnergySlider({ value, onChange }: Props) {
  const theme = useTheme();
  return (
    <View>
      <View style={styles.headerRow}>
        <Typography variant="bodySmall" color={theme.colors.textSecondary}>
          Energy level
        </Typography>
        <Typography variant="bodySmall" color={theme.raw.roseDark} weight="600">
          {LABELS[value]} ({value}/5)
        </Typography>
      </View>
      <Slider
        minimumValue={1}
        maximumValue={5}
        step={1}
        value={value}
        onValueChange={v => onChange(Math.round(v) as EnergyScore)}
        minimumTrackTintColor={theme.raw.rose}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.raw.rose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});
