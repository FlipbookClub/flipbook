import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { WelcomeScreen } from "@/screens/auth/WelcomeScreen";

export type AuthStackParamList = {
  Welcome: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
    </Stack.Navigator>
  );
}
