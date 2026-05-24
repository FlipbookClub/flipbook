import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CreateAccountScreen } from "@/screens/auth/CreateAccountScreen";
import { SignInScreen } from "@/screens/auth/SignInScreen";
import { VerifyEmailScreen } from "@/screens/auth/VerifyEmailScreen";
import { WelcomeScreen } from "@/screens/auth/WelcomeScreen";

export type AuthStackParamList = {
  Welcome: undefined;
  CreateAccount: undefined;
  SignIn: undefined;
  VerifyEmail: { email: string; flow?: "signup" | "signin" };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    </Stack.Navigator>
  );
}
