export interface PublishedDocsVersion {
  version: string;
  sourceCommit: string;
  publishedAt: string;
  pages: string[];
}

export interface DocsVersions {
  schemaVersion: 1;
  package: '@sudden3/leaf-ui';
  latest: string;
  versions: PublishedDocsVersion[];
}

export function versionTarget(
  siteBase: string,
  pathname: string,
  hash: string,
  release: PublishedDocsVersion,
  latestVersion: string,
) {
  const base = `${siteBase.replace(/\/$/, '')}/`;
  let page = pathname.startsWith(base) ? pathname.slice(base.length) : '';
  page = page.replace(/^v\/[^/]+\//, '').replace(/^\/+/, '');
  if (!page || page.endsWith('/')) page += 'index.html';
  if (!page.endsWith('.html')) page += '.html';
  const exact = release.pages.includes(page);
  const english = page.startsWith('en/');
  const overview = page.replace(/^en\//, '').startsWith('guide/')
    ? 'guide/introduction.html'
    : 'components/index.html';
  const fallback = [
    ...(english ? [page.slice(3), `en/${overview}`, 'en/index.html'] : []),
    overview,
    'index.html',
  ].find((candidate) => release.pages.includes(candidate));
  return {
    href: `${base}${release.version === latestVersion ? '' : `v/${release.version}/`}${exact ? page : (fallback ?? 'index.html')}${exact ? hash : ''}`,
    exact,
  };
}
