import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
};

export type TabParamList = {
  Home: undefined;
  Log: { date?: string } | undefined;
  Insights: undefined;
  Reminders: undefined;
  Settings: undefined;
};
