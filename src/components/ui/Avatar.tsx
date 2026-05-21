import { Image, Text, View, type ImageSourcePropType } from "react-native";

import { palette } from "@/theme/palette";

const FALLBACK_COLORS: string[] = [
  palette.brandPrimaryLight,
  palette.accent,
  palette.highlight,
  palette.success,
  palette.accentDeep,
  palette.info,
];

const SIZE_TOKENS = { sm: 28, md: 40, lg: 56, xl: 80 } as const;
export type AvatarSize = keyof typeof SIZE_TOKENS;

export interface AvatarProps {
  name: string;
  imageUri?: string | null;
  size?: AvatarSize;
}

function hashIndex(seed: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % modulo;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, imageUri, size = "md" }: AvatarProps) {
  const dimension = SIZE_TOKENS[size];
  const radius = dimension / 2;

  if (imageUri) {
    const source: ImageSourcePropType = { uri: imageUri };
    return (
      <Image
        source={source}
        accessibilityLabel={name}
        style={{ width: dimension, height: dimension, borderRadius: radius }}
      />
    );
  }

  const background = FALLBACK_COLORS[hashIndex(name, FALLBACK_COLORS.length)];
  const fontSize = Math.round(dimension * 0.4);

  return (
    <View
      accessibilityLabel={name}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: radius,
        backgroundColor: background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: palette.textOnBrand,
          fontFamily: "Raleway-SemiBold",
          fontSize,
        }}
      >
        {initialsFor(name)}
      </Text>
    </View>
  );
}
