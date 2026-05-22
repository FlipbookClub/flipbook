import { Pressable, Text, View } from "react-native";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

interface Props {
  title: string;
  author: string;
  pageCount?: number;
  size?: "sm" | "md" | "lg";
  onPress?: () => void;
}

const DIMS = {
  sm: { width: 56, height: 80, fontSize: 22 },
  md: { width: 84, height: 120, fontSize: 32 },
  lg: { width: 120, height: 168, fontSize: 44 },
};

export function BookCover({ title, author, pageCount, size = "md", onPress }: Props) {
  const { colors } = useTheme();
  const dims = DIMS[size];
  const initial = title.trim().slice(0, 1).toUpperCase() || "?";

  const content = (
    <View style={{ gap: spacing.s2, alignItems: "flex-start" }}>
      <View
        style={{
          width: dims.width,
          height: dims.height,
          borderRadius: radius.md,
          backgroundColor: palette.brandPrimary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Text
          style={{
            fontFamily: "Raleway-Bold",
            fontSize: dims.fontSize,
            color: palette.textOnBrand,
          }}
        >
          {initial}
        </Text>
      </View>
      <View style={{ width: dims.width, gap: 2 }}>
        <Text
          style={{ ...typography.bodySm, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text style={{ ...typography.bodySm, color: colors.textMuted }} numberOfLines={1}>
          {author}
        </Text>
        {pageCount !== undefined ? (
          <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
            {pageCount} {pageCount === 1 ? "page" : "pages"}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${title}`}>
      {content}
    </Pressable>
  );
}
