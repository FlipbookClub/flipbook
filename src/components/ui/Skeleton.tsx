import { useEffect } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { palette } from "@/theme/palette";
import { radius } from "@/theme/spacing";

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = radius.sm,
  style,
}: SkeletonProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(progress);
    };
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor:
      progress.value < 0.5 ? palette.gray1 : palette.gray2,
  }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius }, animatedStyle, style]}
    />
  );
}
