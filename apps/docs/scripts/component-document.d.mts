export interface ExampleIdentity {
  id: string;
  index: number;
  title: string;
}

export interface ComponentExampleDocument extends ExampleIdentity {
  markdown: string;
}

export interface ComponentDocument {
  component: string;
  primaryApi: string;
  title: string;
  description: string;
  introduction: string;
  basic: string;
  api: string;
  apiNames: string[];
  examples: ComponentExampleDocument[];
}

export interface ParsedComponentDocument {
  component: string;
  primaryApi: string;
  title: string;
  basic: ExampleIdentity;
  examples: ExampleIdentity[];
  apiNames: string[];
}

export function parseComponentDocument(
  source: string,
  file?: string,
): ParsedComponentDocument | null;
export function readComponentDocument(file: string): Promise<ComponentDocument | null>;
export function orderPrimaryComponentApi(source: string, file?: string): string;
export function componentDetail(document: ComponentDocument): Omit<
  ComponentDocument,
  'examples'
> & {
  examples: ExampleIdentity[];
};
export function selectExamples(
  document: ComponentDocument,
  selectors: (string | number)[],
): ComponentExampleDocument[];
/** @internal Source-range composition for the documentation extractor, not a component API. */
export function applySourceEdits(
  source: string,
  edits: { start: number; end: number; value: string }[],
): string;
export function remarkComponentDocument(): (
  tree: unknown,
  file: { value?: unknown; path?: string },
) => void;
