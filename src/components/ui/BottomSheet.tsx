import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo, type ReactNode } from "react";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";

export interface BottomSheetProps extends Partial<BottomSheetModalProps> {
  snapPoints?: (string | number)[];
  children: ReactNode;
}

export const BottomSheet = forwardRef<BottomSheetModal, BottomSheetProps>(function BottomSheet(
  { snapPoints, children, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const points = useMemo(() => snapPoints ?? ["40%", "75%"], [snapPoints]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={points}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: palette.gray2,
        width: 32,
        height: 4,
      }}
      backgroundStyle={{
        backgroundColor: colors.surfacePrimary,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
      }}
      {...rest}
    >
      <BottomSheetView style={{ padding: spacing.s5 }}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
});
