import React, { memo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { PhaseConfig } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import type { CyclePhase } from '../../types/cycle';
import { Typography } from '../shared/Typography';
import { HapticEngine } from '../../utils/haptics';

interface Props {
  day: number;
  isoDate: string;
  phase: CyclePhase | null;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  onPress: (isoDate: string) => void;
}

const SPRING = { damping: 12, stiffness: 350, mass: 0.4 };

function DayCellInner({ day, isoDate, phase, isToday, isSelected, isCurrentMonth, onPress }: Props) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const phaseInfo = phase ? PhaseConfig[phase] : null;
  const phaseColor = phaseInfo?.color ?? null;
  const phaseLight = phaseInfo?.lightColor ?? null;
  const isPredicted = phase === 'predicted_menstrual';

  const bg = !isCurrentMonth ? 'transparent' : phaseLight ? phaseLight : 'transparent';
  const fg = !isCurrentMonth ? theme.colors.textSecondary
    : phaseColor && (phase === 'follicular' || phase === 'predicted_menstrual' || phase === 'luteal') ? theme.raw.gray900
    : phaseColor ? theme.raw.white
    : theme.colors.textPrimary;

  const handlePressIn = () => { scale.value = withSpring(0.85, SPRING); };
  const handlePressOut = () => { scale.value = withSequence(withSpring(1.1, SPRING), withSpring(1, SPRING)); };
  const handlePress = () => { HapticEngine.selection(); onPress(isoDate); };

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} style={styles.cellWrapper}>
      <Animated.View
        style={[
          styles.cell,
          {
            backgroundColor: bg,
            borderRadius: theme.radius.full,
            borderWidth: isSelected ? 2 : isToday ? 1.5 : 0,
            borderColor: isSelected ? theme.raw.roseDark : theme.raw.rose,
            borderStyle: isPredicted ? 'dashed' : 'solid',
          },
          animStyle,
        ]}
      >
        <View style={styles.content}>
          <Typography variant="bodySmall" color={fg} weight={isToday ? '700' : '500'}>{day}</Typography>
          {/* Tiny dot indicator for today */}
          {isToday ? <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.raw.rose, marginTop: 1 }} /> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cellWrapper: { flex: 1, aspectRatio: 1, margin: 2 },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', justifyContent: 'center' },
});

export const DayCell = memo(DayCellInner);
