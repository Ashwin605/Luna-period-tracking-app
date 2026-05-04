import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

import { useTheme } from '../hooks/useTheme';
import { HapticEngine } from '../utils/haptics';
import { HomeScreen } from '../screens/HomeScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { LogScreen } from '../screens/LogScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
}

function AnimatedTabIcon({ name, color, size, focused }: TabIconProps) {
  const scale = useSharedValue(1);
  const dotOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.25, { damping: 8, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
      dotOpacity.value = withTiming(1, { duration: 250 });
      HapticEngine.tabSwitch();
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      dotOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotOpacity.value }],
  }));

  return (
    <View style={tabStyles.iconWrap}>
      <Animated.View style={iconStyle}>
        <Ionicons name={name} color={color} size={size} />
      </Animated.View>
      <Animated.View
        style={[
          tabStyles.dot,
          { backgroundColor: color },
          dotStyle,
        ]}
      />
    </View>
  );
}

export function TabNavigator() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.raw.rose,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: theme.isDark
            ? 'rgba(26, 26, 24, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          borderTopColor: theme.isDark
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(0,0,0,0.06)',
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          // Frosted glass effect
          ...(Platform.OS === 'ios'
            ? {}
            : { elevation: 20 }),
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
              size={22}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Log"
        component={LogScreen}
        options={{
          tabBarLabel: 'Log',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={focused ? 'create' : 'create-outline'}
              color={color}
              size={22}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={focused ? 'stats-chart' : 'stats-chart-outline'}
              color={color}
              size={22}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={focused ? 'notifications' : 'notifications-outline'}
              color={color}
              size={22}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={focused ? 'settings' : 'settings-outline'}
              color={color}
              size={22}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
