import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LibraryScreen } from "@/screens/library/LibraryScreen";
import { ReaderScreen } from "@/screens/reader/ReaderScreen";

import type { Id } from "../../convex/_generated/dataModel";

// Library tab gets its own Reader registration so opening a book from the
// library keeps "back" inside the Library tab instead of bouncing across tabs.
export type LibraryStackParamList = {
  LibraryHome: undefined;
  Reader: { bookId: Id<"books">; jumpToPage?: number };
};

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export function LibraryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="LibraryHome" component={LibraryScreen} />
      <Stack.Screen
        name="Reader"
        component={ReaderScreen}
        options={{ animation: "slide_from_bottom" }}
      />
    </Stack.Navigator>
  );
}
