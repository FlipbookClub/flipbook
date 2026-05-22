import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BookOpen, Palette, User, Users } from "lucide-react-native";

import { CommunityStack } from "@/navigation/CommunityStack";
import { LibraryStack } from "@/navigation/LibraryStack";
import { ProfileStack } from "@/navigation/ProfileStack";
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
        component={CommunityStack}
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryStack}
        options={{
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
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
