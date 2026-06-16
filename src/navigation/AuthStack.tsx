import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CreateAccountScreen } from "@/screens/auth/CreateAccountScreen";
import { ForgotPasswordScreen } from "@/screens/auth/ForgotPasswordScreen";
import { ResetPasswordScreen } from "@/screens/auth/ResetPasswordScreen";
import { SignInScreen } from "@/screens/auth/SignInScreen";
import { VerifyEmailScreen } from "@/screens/auth/VerifyEmailScreen";
import { WelcomeScreen } from "@/screens/auth/WelcomeScreen";

export type AuthStackParamList = {
  Welcome: undefined;
  CreateAccount: undefined;
  SignIn: undefined;
  // `client_trust` = Attack-Protection email code required for a password
  // sign-in from a new device (Clerk needs_client_trust); reuses VerifyEmail.
  VerifyEmail: { email: string; flow?: "signup" | "signin" | "client_trust" };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
