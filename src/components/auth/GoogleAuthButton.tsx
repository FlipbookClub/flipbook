import { useState } from "react";
import { Pressable, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

import { radius, spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

interface GoogleAuthButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

// "Sign in with Google" button per Google brand guidelines:
//   https://developers.google.com/identity/branding-guidelines
// White surface, 1pt gray border, dark text + the official multi-color "G"
// logomark. Min height 44pt; same 8pt corner radius as our other buttons so
// it sits cleanly in our Figma form context.
export function GoogleAuthButton({ label, onPress, disabled }: GoogleAuthButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.s2,
        height: 48,
        paddingHorizontal: spacing.s4,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: "#DADCE0",
        backgroundColor: pressed ? "#F8F9FA" : "#FFFFFF",
        opacity: disabled ? 0.5 : 1,
        alignSelf: "stretch",
      }}
    >
      <Svg width={18} height={18} viewBox="0 0 18 18">
        <Path
          d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.8741 2.6836-6.615z"
          fill="#4285F4"
        />
        <Path
          d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.806.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z"
          fill="#34A853"
        />
        <Path
          d="M3.964 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.957C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.957 4.0418L3.964 10.71z"
          fill="#FBBC05"
        />
        <Path
          d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z"
          fill="#EA4335"
        />
      </Svg>
      <Text
        style={{
          ...typography.bodyLg,
          fontFamily: "Raleway-SemiBold",
          fontSize: 15,
          color: "#1F1F1F",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
