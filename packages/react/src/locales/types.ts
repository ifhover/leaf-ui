import type { LocaleMessages } from './messages';

export type { LocaleMessages } from './messages';

type PartialMessages<T> = {
  readonly [K in keyof T]?: T[K] extends string | readonly unknown[] ? T[K] : PartialMessages<T[K]>;
};

/** Partial, JSON-compatible translation content. Missing entries use the locale chain. */
export type LeafTranslation = PartialMessages<LocaleMessages> & {
  /** Optional editor schema reference; ignored at runtime. */
  readonly $schema?: string;
};
/** Resources indexed by BCP 47 language tag. Nested providers merge individual entries. */
export type LeafTranslations = Readonly<Record<string, LeafTranslation>>;

export type TranslationKey = {
  [Group in keyof LocaleMessages]: {
    [Key in keyof LocaleMessages[Group]]: LocaleMessages[Group][Key] extends string
      ? `${Group}.${Key & string}`
      : never;
  }[keyof LocaleMessages[Group]];
}[keyof LocaleMessages];
