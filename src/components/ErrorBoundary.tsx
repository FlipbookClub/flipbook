import { Component, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { captureException } from "@/lib/monitoring";
import { palette } from "@/theme/palette";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

// Root error boundary. Catches render/runtime errors anywhere below it so a bug
// in one screen shows a recoverable notice instead of a frozen/white app. Sits
// ABOVE the theme provider, so it must use static palette colors (no useTheme).
// Reports to monitoring (Sentry, if configured) and offers a real JS reload via
// expo-updates as recovery.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    captureException(error, { componentStack: info?.componentStack ?? "" });
  }

  handleRestart = () => {
    // Prefer a full JS reload (expo-updates is in the binary); fall back to
    // clearing the boundary so the tree re-renders.
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Updates = require("expo-updates");
      if (Updates?.reloadAsync) {
        Updates.reloadAsync().catch(() => this.setState({ error: null }));
        return;
      }
    } catch {
      /* expo-updates unavailable — just reset */
    }
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: palette.surfaceWarm,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          gap: 16,
        }}
      >
        <Text
          style={{
            fontFamily: "Raleway-Bold",
            fontSize: 22,
            color: palette.gray11,
            textAlign: "center",
          }}
        >
          Something went wrong
        </Text>
        <Text
          style={{
            fontFamily: "Inter-Regular",
            fontSize: 15,
            lineHeight: 22,
            color: palette.gray9,
            textAlign: "center",
          }}
        >
          The app hit an unexpected error. Restarting usually clears it. If it keeps happening,
          let us know.
        </Text>
        <Pressable
          onPress={this.handleRestart}
          accessibilityRole="button"
          accessibilityLabel="Restart the app"
          style={{
            backgroundColor: palette.brandPrimary,
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderRadius: 999,
            marginTop: 8,
          }}
        >
          <Text style={{ color: palette.textOnBrand, fontFamily: "Raleway-SemiBold", fontSize: 16 }}>
            Restart app
          </Text>
        </Pressable>
      </View>
    );
  }
}
