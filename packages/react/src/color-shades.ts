/** Numbers are the percentage of white or black mixed into the unchanged base, in tens. */
export const semanticColorShadeSteps = [
  'light-3',
  'light-7',
  'light-9',
  'dark-1',
  'dark-3',
  'dark-7',
  'dark-9',
] as const;

export type ColorShadeStep = (typeof semanticColorShadeSteps)[number];
export type ColorShades = Record<ColorShadeStep, string>;
