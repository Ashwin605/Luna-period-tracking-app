import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { useTheme } from '../hooks/useTheme';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useSettingsStore } from '../store/settingsStore';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const onboardingComplete = useSettingsStore(s => s.onboardingComplete);

  const navTheme = theme.isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surfaceElevated,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          primary: theme.raw.rose,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surfaceElevated,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          primary: theme.raw.rose,
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        key={onboardingComplete ? 'main' : 'onboard'}
        screenOptions={{ headerShown: false }}
      >
        {!onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Tabs" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
