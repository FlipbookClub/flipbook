import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useMutation, useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GenrePicker } from "@/components/features/GenrePicker";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { CommunityStackParamList } from "@/navigation/CommunityStack";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<CommunityStackParamList, "EditBook">;

const MAX_TITLE = 200;
const MAX_AUTHOR = 100;

export function EditBookScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { bookId } = route.params;
  const result = useQuery(api.books.get, { bookId });
  const updateMetadata = useMutation(api.books.updateMetadata);

  const [seeded, setSeeded] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (result?.book && !seeded) {
      setTitle(result.book.title);
      setAuthor(result.book.author);
      setGenre(result.book.genre ?? null);
      setSeeded(true);
    }
  }, [result, seeded]);

  const trimmedTitle = title.trim();
  const trimmedAuthor = author.trim();
  const canSave =
    seeded &&
    trimmedTitle.length > 0 &&
    trimmedTitle.length <= MAX_TITLE &&
    trimmedAuthor.length > 0 &&
    trimmedAuthor.length <= MAX_AUTHOR &&
    !submitting;

  const handleSave = async () => {
    if (!canSave) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await updateMetadata({
        bookId,
        title: trimmedTitle,
        author: trimmedAuthor,
        genre: genre ?? undefined,
      });
      navigation.goBack();
    } catch (err) {
      const code = (err as { data?: { code?: string } })?.data?.code;
      setFormError(
        code === "invalid_title"
          ? "Give the book a title."
          : code === "invalid_author"
            ? "Add an author."
            : code === "not_allowed"
              ? "Only the moderator or the person who added this book can edit it."
              : "Couldn't save changes. Try again?",
      );
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.s3,
          paddingHorizontal: spacing.s4,
          paddingTop: spacing.s2,
          paddingBottom: spacing.s3,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={spacing.s3}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>Edit book</Text>
      </View>

      {!seeded ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.textMuted} />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ padding: spacing.s5, gap: spacing.s5, paddingBottom: spacing.s7 }}
            keyboardShouldPersistTaps="handled"
          >
            <Input
              label="Title"
              value={title}
              onChangeText={setTitle}
              maxLength={MAX_TITLE}
              autoCapitalize="words"
            />
            <Input
              label="Author"
              value={author}
              onChangeText={setAuthor}
              maxLength={MAX_AUTHOR}
              autoCapitalize="words"
            />

            <View style={{ gap: spacing.s2 }}>
              <Text style={{ ...typography.overlineLg, color: colors.textPrimary }}>
                Genre
              </Text>
              <GenrePicker value={genre} onChange={setGenre} />
            </View>

            {formError ? (
              <Text style={{ ...typography.bodySm, color: palette.error, textAlign: "center" }}>
                {formError}
              </Text>
            ) : null}

            <Button
              label={submitting ? "Saving…" : "Save changes"}
              fullWidth
              disabled={!canSave}
              onPress={handleSave}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
