import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { EditProfileScreen } from "@/screens/profile/EditProfileScreen";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";
import { SettingsScreen } from "@/screens/profile/SettingsScreen";
import { UserProfileScreen } from "@/screens/profile/UserProfileScreen";
import type { Id } from "../../convex/_generated/dataModel";

// Nested stack inside the Profile tab. The home screen is "ProfileHome" (not
// "Profile") so it doesn't collide with the tab's own "Profile" name — that
// collision triggered a React Navigation "same name nested" warning.
export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Settings: undefined;
  // Read-only view of another user's profile. Pushable from any screen that
  // renders a reaction author or club member avatar.
  ViewProfile: { userId: Id<"users"> };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ViewProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  );
}
