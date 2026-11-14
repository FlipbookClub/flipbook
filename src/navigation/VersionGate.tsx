import { Component, useEffect, type ReactNode } from "react";
import { Platform } from "react-native";
import { useQuery } from "convex/react";

import { captureException } from "@/lib/monitoring";
import {
  GATE_OPEN,
  installedVersion,
  resolveVersionGate,
  type VersionGateResult,
} from "@/lib/versionGate";
import { api } from "../../convex/_generated/api";

interface VersionGateProbeProps {
  onChange: (result: VersionGateResult) => void;
}

// S0-2. Renders nothing; watches the appConfig row and reports whether this
// install must update. A live query, so raising or lowering the minimum in the
// Convex dashboard flips the gate on a running app within seconds.
//
// While the query is loading, and for as long as the device is offline, the
// result is undefined and the gate stays open.
function VersionGateQuery({ onChange }: VersionGateProbeProps) {
  const config = useQuery(api.appConfig.getMinVersion, {});
  const result = resolveVersionGate(Platform.OS, installedVersion(), config);
  const { blocked, updateUrl } = result;

  useEffect(() => {
    onChange(blocked ? { blocked, updateUrl } : GATE_OPEN);
  }, [blocked, updateUrl, onChange]);

  return null;
}

interface BoundaryState {
  failed: boolean;
}

// useQuery THROWS during render when the server rejects the query — most
// plausibly a build reaching a phone before appConfig.getMinVersion has been
// deployed to that backend. Without this boundary that error would climb to
// the root ErrorBoundary and replace the whole app with "Something went
// wrong". A broken gate must open, not take the app down with it.
class VersionGateBoundary extends Component<
  VersionGateProbeProps & { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    captureException(error, { where: "VersionGate" });
    this.props.onChange(GATE_OPEN);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function VersionGateProbe({ onChange }: VersionGateProbeProps) {
  return (
    <VersionGateBoundary onChange={onChange}>
      <VersionGateQuery onChange={onChange} />
    </VersionGateBoundary>
  );
}
