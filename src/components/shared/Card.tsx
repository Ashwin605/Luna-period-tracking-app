import React from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

interface Props extends ViewProps {
  padding?: number;
  elevated?: boolean;
  style?: ViewStyle;
}

export function Card({ padding, elevated, style, children, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View
      {...rest}
      style={[
        styles.base,
        {
          backgroundColor: elevated
            ? theme.colors.surfaceElevated
            : theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: padding ?? theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
