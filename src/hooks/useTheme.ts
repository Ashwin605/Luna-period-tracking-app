import { useColorScheme } from 'react-native';

import {
  BorderRadius,
  Colors,
  DarkTheme,
  LightTheme,
  Spacing,
  type ThemeShape,
  Typography,
} from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

export interface Theme {
  colors: ThemeShape;
  raw: typeof Colors;
  spacing: typeof Spacing;
  radius: typeof BorderRadius;
  typography: typeof Typography;
  isDark: boolean;
}

export function useTheme(): Theme {
  const themeMode = useSettingsStore(s => s.themeMode);
  const systemScheme = useColorScheme();
  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  return {
    colors: isDark ? DarkTheme : LightTheme,
    raw: Colors,
    spacing: Spacing,
    radius: BorderRadius,
    typography: Typography,
    isDark,
  };
}
