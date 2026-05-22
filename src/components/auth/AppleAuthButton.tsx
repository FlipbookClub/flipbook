import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { radius, spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

interface AppleAuthButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

// "Sign in with Apple" button per Apple HIG:
//   https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple
// Black surface, white text + white Apple logomark. Apple permits this style
// (and a white variant) only when used to trigger Apple Sign-In. Min height
// 44pt, ~8pt corner radius. Pressed state dims to ~80%.
export function AppleAuthButton({ label, onPress, disabled }: AppleAuthButtonProps) {
  const [pressed, setPressed] = useState(false);
  const opacity = disabled ? 0.5 : pressed ? 0.8 : 1;

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
        backgroundColor: "#000000",
        opacity,
        alignSelf: "stretch",
      }}
    >
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path
          d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
          fill="#FFFFFF"
        />
      </Svg>
      <Text
        style={{
          ...typography.bodyLg,
          fontFamily: "Raleway-SemiBold",
          fontSize: 15,
          color: "#FFFFFF",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
