import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BiometricGate } from '../components/BiometricGate';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import {
  useCyclesQuery,
  useLogsQuery,
  useTodayLogQuery,
} from '../hooks/useCycleData';
import { usePrediction } from '../hooks/usePrediction';
import { useSettingsBootstrap } from '../hooks/useSettingsBootstrap';
import { useTheme } from '../hooks/useTheme';
import { RootNavigator } from '../navigation/RootNavigator';

const queryClient = new QueryClient();

function DataBootstrap({ children }: { children: React.ReactNode }) {
  useCyclesQuery();
  useLogsQuery();
  useTodayLogQuery();
  usePrediction();
  return <>{children}</>;
}

export default function App() {
  const { ready } = useSettingsBootstrap();
  const theme = useTheme();

  if (!ready) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <LoadingSpinner fullscreen label="Preparing Luna…" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar style={theme.isDark ? 'light' : 'dark'} />
            <DataBootstrap>
              <BiometricGate>
                <RootNavigator />
              </BiometricGate>
            </DataBootstrap>
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
