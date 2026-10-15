import { createContext } from 'react';
import type { LeafConfig } from './context';

/** Kept free of language data so motion-only controls do not load translation resources. */
export const ConfigContext = createContext<LeafConfig | undefined>(undefined);
