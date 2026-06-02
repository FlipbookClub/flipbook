import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { EditProfileScreen } from "@/screens/profile/EditProfileScreen";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";
import { SettingsScreen } from "@/screens/profile/SettingsScreen";

// Nested stack inside the Profile tab. The home screen is "ProfileHome" (not
// "Profile") so it doesn't collide with the tab's own "Profile" name — that
// collision triggered a React Navigation "same name nested" warning.
export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
