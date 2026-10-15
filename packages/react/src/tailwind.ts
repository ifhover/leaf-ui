import { leafTailwindTokens } from './tailwind-tokens';

/** Tailwind CSS 3 preset. Extend the application theme without changing its defaults. */
const leafPreset = {
  theme: {
    extend: {
      ...leafTailwindTokens,
      fontSize: Object.fromEntries(
        Object.entries(leafTailwindTokens.fontSize).map(([name, value]) => [
          name,
          [value, { lineHeight: leafTailwindTokens.lineHeight.leaf }] as [
            string,
            { lineHeight: string },
          ],
        ]),
      ),
      minHeight: leafTailwindTokens.spacing,
      minWidth: leafTailwindTokens.spacing,
    },
  },
};

export default leafPreset;
