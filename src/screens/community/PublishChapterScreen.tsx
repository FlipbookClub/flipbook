import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { ChevronLeft, Upload } from "@/lib/icons";
import { useMutation } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { analytics } from "@/lib/analytics";
import { MAX_PDF_BYTES, pickPdf, uploadPdf, type PickedPdf } from "@/lib/pdf";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { CommunityStackParamList } from "@/navigation/CommunityStack";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<CommunityStackParamList, "PublishChapter">;
type Stage = "form" | "uploading" | "publishing";

const MAX_TITLE = 200;
const MAX_NOTE = 500;

export function PublishChapterScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { clubId } = route.params;
  const generateUploadUrl = useMutation(api.chapters.generateUploadUrl);
  const publishChapter = useMutation(api.chapters.publish);

  const [file, setFile] = useState<PickedPdf | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageDetectionError, setPageDetectionError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<Stage>("form");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file && !title) {
      // Pre-fill the title from the filename minus the extension.
      setTitle(file.name.replace(/\.pdf$/i, "").slice(0, MAX_TITLE));
    }
  }, [file, title]);

  const handlePick = async () => {
    const result = await pickPdf();
    if (!result.ok) {
      if (result.reason === "cancelled") return;
      const message =
        result.reason === "too_large"
          ? `Chapters are limited to ${Math.round(MAX_PDF_BYTES / (1024 * 1024))}MB.`
          : result.reason === "not_pdf"
            ? "That doesn't look like a PDF."
            : "Couldn't read that file.";
      Alert.alert("Can't upload", message);
      return;
    }
    setFile(result.file);
    setPageCount(null);
    setPageDetectionError(null);
  };

  const canSubmit =
    stage === "form" &&
    file !== null &&
    title.trim().length > 0 &&
    pageCount !== null &&
    pageCount > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !file || pageCount === null) return;
    setError(null);
    setStage("uploading");
    setProgress(0);
    try {
      const uploadUrl = await generateUploadUrl({ clubId });
      const { storageId } = await uploadPdf(uploadUrl, file, setProgress);
      setStage("publishing");
      await publishChapter({
        clubId,
        title: title.trim(),
        pdfStorageId: storageId as Id<"_storage">,
        pdfPageCount: pageCount,
        fileSize: file.size,
        authorNote: note.trim() || undefined,
      });
      analytics.track("chapter_published", { pages: pageCount });
      navigation.goBack();
    } catch (err) {
      const code = (err as { data?: { code?: string } })?.data?.code;
      const message = (err as { message?: string })?.message;
      setError(code ?? message ?? "The chapter didn't quite make it. Try again?");
      setStage("form");
    }
  };

  const submitLabel =
    stage === "uploading"
      ? `Uploading… ${Math.round(progress * 100)}%`
      : stage === "publishing"
        ? "Publishing…"
        : "Publish chapter";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <View style={{ padding: spacing.s4, flexDirection: "row", alignItems: "center" }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={spacing.s3}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing.s5, gap: spacing.s5, paddingBottom: spacing.s7 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ ...typography.headingLg, color: colors.textPrimary }}>
            Publish a chapter
          </Text>
          <Text style={{ ...typography.bodyMd, color: colors.textSecondary }}>
            Followers get a push the moment you ship.
          </Text>

          <Pressable
            onPress={handlePick}
            accessibilityRole="button"
            accessibilityLabel="Choose PDF"
            style={({ pressed }) => ({
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: pressed ? colors.surfaceSecondary : "transparent",
              padding: spacing.s4,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.s3,
            })}
          >
            <Upload size={20} color={palette.brandPrimary} />
            <View style={{ flex: 1 }}>
              {file ? (
                <>
                  <Text
                    style={{ ...typography.bodyMd, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}
                    numberOfLines={1}
                  >
                    {file.name}
                  </Text>
                  <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                    {pageCount !== null ? ` · ${pageCount} pages` : " · reading PDF…"}
                  </Text>
                </>
              ) : (
                <Text style={{ ...typography.bodyMd, color: colors.textPrimary }}>
                  Choose chapter PDF
                </Text>
              )}
            </View>
          </Pressable>

          <Input
            variant="underline"
            label="Chapter title"
            placeholder="Chapter 4: The Long Goodbye"
            value={title}
            onChangeText={(t) => setTitle(t.length > MAX_TITLE ? t.slice(0, MAX_TITLE) : t)}
            autoCapitalize="words"
            editable={stage === "form"}
          />
          <Input
            variant="boxed"
            label="Author note (optional)"
            placeholder="A short note that opens above the chapter."
            value={note}
            onChangeText={(t) => setNote(t.length > MAX_NOTE ? t.slice(0, MAX_NOTE) : t)}
            multiline
            numberOfLines={4}
            editable={stage === "form"}
          />

          {pageDetectionError ? (
            <Card>
              <Text style={{ ...typography.bodySm, color: palette.error }}>
                {pageDetectionError}
              </Text>
            </Card>
          ) : null}
          {error ? (
            <Text style={{ ...typography.bodySm, color: palette.error }}>{error}</Text>
          ) : null}

          <Button
            label={submitLabel}
            fullWidth
            disabled={!canSubmit}
            onPress={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Hidden Pdf viewer to detect pageCount via onLoadComplete without
          rendering the file to the user. */}
      {file ? (
        <View
          style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Pdf
            source={{ uri: file.uri }}
            onLoadComplete={(numberOfPages) => {
              setPageCount(numberOfPages);
              setPageDetectionError(null);
            }}
            onError={(err) => {
              setPageDetectionError(
                typeof err === "string" ? err : "Couldn't read this PDF. Try a different file.",
              );
            }}
            style={{ width: 1, height: 1 }}
            trustAllCerts={false}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
