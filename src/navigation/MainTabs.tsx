import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BookOpen, Palette, User, Users } from "lucide-react-native";

import { CommunityHomeScreen } from "@/screens/community/CommunityHomeScreen";
import { LibraryScreen } from "@/screens/library/LibraryScreen";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";
import { DesignSystemPreview } from "@/screens/_dev/DesignSystemPreview";
import { palette } from "@/theme/palette";
import { useTheme } from "@/theme/ThemeContext";

export type MainTabsParamList = {
  Community: undefined;
  Library: undefined;
  Profile: undefined;
  Dev: undefined;
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
        component={CommunityHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      {__DEV__ ? (
        <Tab.Screen
          name="Dev"
          component={DesignSystemPreview}
          options={{
            title: "Design",
            tabBarIcon: ({ color, size }) => <Palette color={color} size={size} />,
          }}
        />
      ) : null}
    </Tab.Navigator>
  );
}
