import type { ComponentDocument } from './component-document.mjs';

export interface ComponentDocumentLinkContext {
  base?: string;
  sourceUrl: string | URL;
}

export interface CollectedComponentDocument {
  document: ComponentDocument;
  language: 'zh' | 'en';
  slug: string;
  file: string;
}

export interface ComponentDocsIndex {
  schemaVersion: number;
  package: string;
  version: string;
  sourceCommit: string | null;
  sourceKind: 'release' | 'workspace';
  components: {
    component: string;
    language: 'zh' | 'en';
    title: string;
    description: string;
    primaryApi: string;
    document: string;
    exampleCount: number;
  }[];
}

export const componentPageExceptions: Map<string, string>;
export function collectComponentDocuments(
  repository: string,
): Promise<CollectedComponentDocument[]>;
export function resolveComponentDocumentLinks(
  document: ComponentDocument,
  context: ComponentDocumentLinkContext,
): ComponentDocument;
export function exportComponentDocs(options: {
  repository: string;
  output: string;
  base?: string;
  sourceCommit?: string | null;
}): Promise<ComponentDocsIndex>;
