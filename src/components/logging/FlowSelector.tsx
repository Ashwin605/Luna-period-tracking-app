import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { FLOW_OPTIONS } from '../../constants/symptoms';
import { useTheme } from '../../hooks/useTheme';
import type { FlowLevel } from '../../types/cycle';
import { Typography } from '../shared/Typography';

interface Props { value: FlowLevel; onChange: (value: FlowLevel) => void; }

const SPRING = { damping: 12, stiffness: 300, mass: 0.4 };
const FLOW_ICONS: Record<string, string> = { none: '○', spotting: '◔', light: '◑', medium: '◕', heavy: '●' };

function FlowButton({ opt, active, onSelect }: { opt: { value: string; label: string }; active: boolean; onSelect: () => void }) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => { scale.value = withSpring(0.88, SPRING); };
  const handlePressOut = () => { scale.value = withSequence(withSpring(1.1, SPRING), withSpring(1, SPRING)); };

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onSelect}>
      <Animated.View style={[styles.btn, {
        backgroundColor: active ? theme.raw.rose : theme.colors.surface,
        borderColor: active ? theme.raw.rose : theme.colors.border,
        borderRadius: theme.radius.full,
        borderWidth: active ? 2 : 1,
        shadowColor: active ? theme.raw.rose : 'transparent',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: active ? 0.25 : 0,
        shadowRadius: 6,
        elevation: active ? 3 : 0,
      }, animStyle]}>
        <Typography variant="bodySmall" color={active ? theme.raw.white : theme.colors.textSecondary} align="center" style={{ fontSize: 16 }}>
          {FLOW_ICONS[opt.value]}
        </Typography>
        <Typography variant="bodySmall" color={active ? theme.raw.white : theme.colors.textPrimary} weight={active ? '600' : '400'} align="center" style={{ marginTop: 2 }}>
          {opt.label}
        </Typography>
      </Animated.View>
    </Pressable>
  );
}

export function FlowSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {FLOW_OPTIONS.map(opt => (
        <FlowButton key={opt.value} opt={opt} active={opt.value === value} onSelect={() => onChange(opt.value as FlowLevel)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  btn: { paddingVertical: 10, paddingHorizontal: 14 },
});
