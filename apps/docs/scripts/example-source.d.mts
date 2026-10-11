export function localizeExampleSource(source: string, english?: boolean): string;
export function extractExampleSource(
  source: string,
  names: string | string[],
  options?: { english?: boolean },
): string;
export function extractExampleMarkdown(markdown: string, mdx: string): string;
export function remarkExampleSource(): (tree: unknown) => void;
