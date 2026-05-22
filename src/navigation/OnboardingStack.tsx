import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { DisplayNameScreen } from "@/screens/auth/DisplayNameScreen";
import { GenrePreferencesScreen } from "@/screens/auth/GenrePreferencesScreen";
import { UserDetailsScreen } from "@/screens/auth/UserDetailsScreen";

// Post-signup profile setup. Activated by RootNavigator (TASK-021) when the
// user is signed-in with Clerk but has no Convex `users` row yet. Each step
// passes its collected values forward via route params; the final step calls
// the `users.create` mutation with the full payload.
export type OnboardingStackParamList = {
  DisplayName: undefined;
  UserDetails: { displayName: string };
  GenrePreferences: { displayName: string; firstName: string; lastName: string };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="DisplayName" component={DisplayNameScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="GenrePreferences" component={GenrePreferencesScreen} />
    </Stack.Navigator>
  );
}
