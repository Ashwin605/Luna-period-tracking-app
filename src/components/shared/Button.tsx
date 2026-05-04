import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { Typography } from './Typography';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface Props extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  leadingIcon?: React.ReactNode;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth,
  style,
  leadingIcon,
  ...rest
}: Props) {
  const theme = useTheme();
  const heightMap: Record<Size, number> = { sm: 36, md: 48, lg: 56 };
  const horizontalPad: Record<Size, number> = {
    sm: theme.spacing.md,
    md: theme.spacing.lg,
    lg: theme.spacing.xl,
  };

  const bg =
    variant === 'primary'
      ? theme.raw.rose
      : variant === 'destructive'
      ? theme.raw.error
      : variant === 'secondary'
      ? theme.colors.surfaceElevated
      : 'transparent';

  const fg =
    variant === 'primary' || variant === 'destructive'
      ? theme.raw.white
      : theme.colors.textPrimary;

  const borderColor =
    variant === 'secondary' ? theme.colors.border : 'transparent';

  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          height: heightMap[size],
          paddingHorizontal: horizontalPad[size],
          borderRadius: theme.radius.lg,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {leadingIcon ? (
            <View style={{ marginRight: theme.spacing.sm }}>{leadingIcon}</View>
          ) : null}
          <Typography variant="body" color={fg} weight="600">
            {label}
          </Typography>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
