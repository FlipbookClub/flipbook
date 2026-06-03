import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Libraries, UserProfile } from "@/lib/icons";

import { CommunityStack } from "@/navigation/CommunityStack";
import { LibraryStack } from "@/navigation/LibraryStack";
import { ProfileStack } from "@/navigation/ProfileStack";
import { palette } from "@/theme/palette";
import { useTheme } from "@/theme/ThemeContext";

export type MainTabsParamList = {
  Community: undefined;
  Library: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.accentStrong,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surfaceElevated,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Community"
        component={CommunityStack}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryStack}
        options={{
          tabBarIcon: ({ color, size }) => <Libraries color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => <UserProfile color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
