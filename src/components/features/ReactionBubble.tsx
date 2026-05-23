import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { MessageCircle } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Avatar } from "@/components/ui/Avatar";
import { palette } from "@/theme/palette";
import { useTheme } from "@/theme/ThemeContext";

interface Props {
  emoji?: string;
  isComment: boolean;
  user: { displayName: string; avatarUrl?: string };
  onPress: () => void;
}

// FR-016 + Vision § Motion: light fade-in + 8px horizontal slide on appearance.
// No bounce, no pulse — feels intentional, not novelty.
const FADE_DURATION_MS = 160;
const SLIDE_FROM_X = 8;
const BUBBLE_SIZE = 36;

export function ReactionBubble({ emoji, isComment, user, onPress }: Props) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(SLIDE_FROM_X);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: FADE_DURATION_MS });
    translateX.value = withTiming(0, { duration: FADE_DURATION_MS });
  }, [opacity, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          isComment ? `Comment from ${user.displayName}` : `${emoji} from ${user.displayName}`
        }
        style={{ alignItems: "center", gap: 2 }}
      >
        <View
          style={{
            width: BUBBLE_SIZE,
            height: BUBBLE_SIZE,
            borderRadius: BUBBLE_SIZE / 2,
            backgroundColor: colors.surfacePrimary,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {isComment ? (
            <MessageCircle size={18} color={palette.brandPrimary} />
          ) : (
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
          )}
        </View>
        <View style={{ marginTop: -10 }}>
          <Avatar name={user.displayName} imageUri={user.avatarUrl} size="sm" />
        </View>
      </Pressable>
    </Animated.View>
  );
}
