import type { ReactNode } from "react";

interface DevOnlyProps {
  enabled: boolean;
  children: ReactNode;
}

export const DevOnly = ({ enabled, children }: DevOnlyProps) => {
  if (!enabled) {
    return null;
  }

  return <>{children}</>;
};
