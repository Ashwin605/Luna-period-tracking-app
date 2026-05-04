import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { MOOD_EMOJIS, MOOD_LABELS } from '../../constants/symptoms';
import { useTheme } from '../../hooks/useTheme';
import type { MoodScore } from '../../types/cycle';
import { Typography } from '../shared/Typography';

interface Props { value: MoodScore; onChange: (value: MoodScore) => void; }

const MOODS: MoodScore[] = [1, 2, 3, 4, 5];
const SPRING = { damping: 12, stiffness: 300, mass: 0.4 };

function MoodButton({ score, active, onSelect }: { score: MoodScore; active: boolean; onSelect: () => void }) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => { scale.value = withSpring(0.88, SPRING); };
  const handlePressOut = () => { scale.value = withSequence(withSpring(1.12, SPRING), withSpring(1, SPRING)); };

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onSelect} style={{ flex: 1 }}>
      <Animated.View style={[styles.btn, {
        backgroundColor: active ? theme.raw.roseLight : theme.colors.surface,
        borderColor: active ? theme.raw.rose : theme.colors.border,
        borderRadius: theme.radius.lg,
        borderWidth: active ? 2 : 1,
        shadowColor: active ? theme.raw.rose : 'transparent',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: active ? 0.2 : 0,
        shadowRadius: 6,
        elevation: active ? 3 : 0,
      }, animStyle]}>
        <Typography variant="h2" align="center">{MOOD_EMOJIS[score]}</Typography>
        <Typography variant="caption" align="center" color={active ? theme.raw.roseDark : theme.colors.textSecondary} style={{ marginTop: 4 }}>
          {MOOD_LABELS[score]}
        </Typography>
      </Animated.View>
    </Pressable>
  );
}

export function MoodSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {MOODS.map(score => (
        <MoodButton key={score} score={score} active={score === value} onSelect={() => onChange(score)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  btn: { flex: 1, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center' },
});
