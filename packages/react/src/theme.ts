import type { CSSProperties } from 'react';

/** Inline CSS variables for a Leaf UI theme scope. */
export type LeafThemeStyle = CSSProperties & {
  [key: `--leaf-${string}`]: string | number | undefined;
};
