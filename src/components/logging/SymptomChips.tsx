import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  EMOTIONAL_SYMPTOMS,
  PHYSICAL_SYMPTOMS,
} from '../../constants/symptoms';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../shared/Typography';

interface Props {
  selected: string[];
  onToggle: (symptom: string) => void;
}

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function Chip({ label, active, onPress }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.raw.roseLight : theme.colors.surface,
          borderColor: active ? theme.raw.rose : theme.colors.border,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      <Typography
        variant="bodySmall"
        color={active ? theme.raw.roseDark : theme.colors.textPrimary}
        weight={active ? '600' : '400'}
        numberOfLines={2}
      >
        {label}
      </Typography>
    </Pressable>
  );
}

export function SymptomChips({ selected, onToggle }: Props) {
  const theme = useTheme();

  const renderPhysical = useCallback(
    ({ item }: { item: string }) => (
      <View style={styles.cell}>
        <Chip
          label={item}
          active={selected.includes(item)}
          onPress={() => onToggle(item)}
        />
      </View>
    ),
    [onToggle, selected]
  );

  const renderEmotional = useCallback(
    ({ item }: { item: string }) => (
      <View style={styles.cell}>
        <Chip
          label={item}
          active={selected.includes(item)}
          onPress={() => onToggle(item)}
        />
      </View>
    ),
    [onToggle, selected]
  );

  return (
    <View>
      <Typography
        variant="label"
        color={theme.colors.textSecondary}
        style={styles.section}
      >
        PHYSICAL
      </Typography>
      <FlashList
        data={[...PHYSICAL_SYMPTOMS]}
        numColumns={3}
        estimatedItemSize={52}
        keyExtractor={item => item}
        renderItem={renderPhysical}
        scrollEnabled={false}
        style={{
          height: Math.ceil(PHYSICAL_SYMPTOMS.length / 3) * 56,
        }}
      />

      <Typography
        variant="label"
        color={theme.colors.textSecondary}
        style={[styles.section, { marginTop: 16 }]}
      >
        EMOTIONAL
      </Typography>
      <FlashList
        data={[...EMOTIONAL_SYMPTOMS]}
        numColumns={3}
        estimatedItemSize={52}
        keyExtractor={item => item}
        renderItem={renderEmotional}
        scrollEnabled={false}
        style={{
          height: Math.ceil(EMOTIONAL_SYMPTOMS.length / 3) * 56,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  cell: {
    flex: 1,
    padding: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
});
