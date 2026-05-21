import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";

import { useTheme } from "@/theme/ThemeContext";
import { radius, shadows, spacing } from "@/theme/spacing";

export interface CardProps extends ViewProps {
  padded?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  padded = true,
  elevated = true,
  style,
  children,
  ...rest
}: CardProps) {
  const { colors } = useTheme();

  const shadowStyle = elevated
    ? {
        ...shadows.sm,
        shadowOpacity: shadows.sm.shadowOpacity * colors.shadowOpacity,
      }
    : null;

  return (
    <View
      style={[
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: radius.md,
          padding: padded ? spacing.s4 : 0,
        },
        shadowStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
