import { Text, View } from "react-native";

import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

// FR-022: rendered on reactions from the moderator of a creator-type club.
// Golden Sand (#e4b363) per the brand spec.
export function AuthorBadge() {
  return (
    <View
      style={{
        paddingVertical: 2,
        paddingHorizontal: spacing.s2,
        borderRadius: 999,
        backgroundColor: palette.highlight,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          ...typography.uiLabelMd,
          fontFamily: "Raleway-SemiBold",
          color: "#1a1a1a",
        }}
      >
        Author
      </Text>
    </View>
  );
}
