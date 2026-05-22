import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ProfileScreen } from "@/screens/profile/ProfileScreen";
import { SettingsScreen } from "@/screens/profile/SettingsScreen";

// Nested stack inside the Profile tab so Settings pushes from Profile (instead
// of being a separate top-level tab). TASK-022 ships the stub; richer
// account/preferences screens add on top later.
export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
