import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from "react-native";
import Pdf from "react-native-pdf";
import { captureRef } from "react-native-view-shot";
import { X } from "lucide-react-native";
import { useMutation } from "convex/react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GenrePicker } from "@/components/features/GenrePicker";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";
import { uploadBinary, uploadPdf, type PickedPdf } from "@/lib/pdf";

// Off-screen render size for the cover capture. Tall portrait ratio so the
// page-1 thumbnail matches the 56x80 cards; rendered big enough to stay crisp.
const COVER_W = 240;
const COVER_H = 340;

import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

interface Props {
  visible: boolean;
  clubId: Id<"clubs">;
  file: PickedPdf | null;
  onClose: () => void;
  onUploaded: (bookId: Id<"books">) => void;
}

type Stage = "metadata" | "uploading" | "registering";

export function BookUploadSheet({ visible, clubId, file, onClose, onUploaded }: Props) {
  const { colors } = useTheme();
  const generateUploadUrl = useMutation(api.books.generateUploadUrl);
  const registerBook = useMutation(api.books.register);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageDetectionError, setPageDetectionError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<Stage>("metadata");
  const [error, setError] = useState<string | null>(null);
  // Local uri of the captured first-page cover, once the off-screen Pdf has
  // rendered. Best-effort: if capture fails the book just uploads cover-less.
  const coverViewRef = useRef<View>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setTitle("");
      setAuthor("");
      setGenre(null);
      setPageCount(null);
      setPageDetectionError(null);
      setProgress(0);
      setStage("metadata");
      setError(null);
      setCoverUri(null);
    }
  }, [visible]);

  // Pre-fill the title from the filename minus the extension. Saves a few
  // taps in the common "I already named the file what I want" case.
  useEffect(() => {
    if (file && !title) {
      setTitle(file.name.replace(/\.pdf$/i, "").slice(0, 200));
    }
  }, [file, title]);

  if (!file) return null;

  const canSubmit =
    stage === "metadata" &&
    title.trim().length > 0 &&
    author.trim().length > 0 &&
    pageCount !== null &&
    pageCount > 0;

  const handleSubmit = async () => {
    if (!canSubmit || pageCount == null) return;
    setError(null);
    setStage("uploading");
    setProgress(0);
    try {
      const uploadUrl = await generateUploadUrl({ clubId });
      const { storageId } = await uploadPdf(uploadUrl, file, setProgress);

      // Upload the captured cover thumbnail, if we have one. Best-effort —
      // never block the book upload on the cover.
      setStage("registering");
      let coverStorageId: Id<"_storage"> | undefined;
      if (coverUri) {
        try {
          const coverUploadUrl = await generateUploadUrl({ clubId });
          const cover = await uploadBinary(coverUploadUrl, coverUri, "image/jpeg");
          coverStorageId = cover.storageId as Id<"_storage">;
        } catch {
          // ignore — fall back to the colored initial
        }
      }

      const bookId = await registerBook({
        clubId,
        title: title.trim(),
        author: author.trim(),
        genre: genre ?? undefined,
        pdfStorageId: storageId as Id<"_storage">,
        pdfPageCount: pageCount,
        fileSize: file.size,
        coverStorageId,
      });
      onUploaded(bookId);
      onClose();
    } catch (err) {
      const message =
        (err as { data?: { code?: string } })?.data?.code ??
        (err as { message?: string })?.message ??
        "The book didn't quite make it. Try again?";
      setError(message);
      setStage("metadata");
    }
  };

  const stageLabel =
    stage === "uploading"
      ? `Uploading… ${Math.round(progress * 100)}%`
      : stage === "registering"
        ? "Finalizing…"
        : pageCount == null && !pageDetectionError
          ? "Reading PDF…"
          : "Add book";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Pressable
          onPress={stage === "metadata" ? onClose : undefined}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
          accessibilityLabel="Dismiss sheet"
        />
        <View
          style={{
            backgroundColor: colors.surfacePrimary,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            paddingHorizontal: spacing.s4,
            paddingTop: spacing.s3,
            paddingBottom: spacing.s5,
            gap: spacing.s4,
          }}
        >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>Add a book</Text>
          {stage === "metadata" ? (
            <Pressable
              onPress={onClose}
              hitSlop={spacing.s3}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={22} color={colors.textPrimary} />
            </Pressable>
          ) : null}
        </View>

        <View style={{ gap: spacing.s1 }}>
          <Text style={{ ...typography.bodySm, color: colors.textMuted }} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
            {(file.size / (1024 * 1024)).toFixed(1)} MB
            {pageCount !== null ? ` · ${pageCount} pages` : ""}
          </Text>
        </View>

        <View style={{ gap: spacing.s3 }}>
          <Input
            variant="underline"
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            autoCapitalize="words"
            editable={stage === "metadata"}
            maxLength={200}
          />
          <Input
            variant="underline"
            placeholder="Author"
            value={author}
            onChangeText={setAuthor}
            autoCapitalize="words"
            editable={stage === "metadata"}
            maxLength={100}
          />
        </View>

        <View style={{ gap: spacing.s2 }}>
          <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>Genre (optional)</Text>
          <GenrePicker
            value={genre}
            onChange={setGenre}
            disabled={stage !== "metadata"}
          />
        </View>

        {pageDetectionError ? (
          <Text style={{ ...typography.bodySm, color: palette.error }}>{pageDetectionError}</Text>
        ) : null}
        {error ? (
          <Text style={{ ...typography.bodySm, color: palette.error }}>{error}</Text>
        ) : null}

        <Button
          label={stageLabel}
          fullWidth
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
        </View>
      </KeyboardAvoidingView>

      {/* Off-screen Pdf used both to read pageCount (onLoadComplete) and to
          capture the first page as a cover thumbnail. Rendered at a real size
          far off-screen (not opacity:0 — view-shot can't capture invisible
          views) so the user never sees it. */}
      <View
        ref={coverViewRef}
        collapsable={false}
        style={{
          position: "absolute",
          left: -10000,
          top: 0,
          width: COVER_W,
          height: COVER_H,
          backgroundColor: "#ffffff",
        }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Pdf
          source={{ uri: file.uri }}
          singlePage
          fitPolicy={2}
          onLoadComplete={(numberOfPages) => {
            setPageCount(numberOfPages);
            setPageDetectionError(null);
            // Give PDFKit a beat to paint page 1, then snapshot it.
            setTimeout(() => {
              captureRef(coverViewRef, { format: "jpg", quality: 0.7, result: "tmpfile" })
                .then((uri) => setCoverUri(uri))
                .catch(() => {
                  /* best-effort — book uploads cover-less */
                });
            }, 600);
          }}
          onError={(err) => {
            setPageDetectionError(
              typeof err === "string" ? err : "Couldn't read this PDF. Try a different file.",
            );
          }}
          style={{ width: COVER_W, height: COVER_H }}
          trustAllCerts={false}
        />
      </View>
    </Modal>
  );
}
