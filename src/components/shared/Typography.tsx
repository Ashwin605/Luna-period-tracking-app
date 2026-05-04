import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
}

export function Typography({
  variant = 'body',
  color,
  align,
  weight,
  style,
  children,
  ...rest
}: Props) {
  const theme = useTheme();
  const base = theme.typography[variant];
  return (
    <Text
      {...rest}
      style={[
        base,
        {
          color: color ?? theme.colors.textPrimary,
          textAlign: align,
        },
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
