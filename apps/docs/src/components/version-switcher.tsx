import { useLang } from '@rspress/core/runtime';
import { Button } from '@sudden3/leaf-ui';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import packageInfo from '../../../../packages/react/package.json';
import { type DocsVersions, versionTarget } from './version-path';
import './version-switcher.scss';

export function VersionSwitcher() {
  const english = useLang() === 'en';
  const [manifest, setManifest] = useState<DocsVersions>();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState({ pathname: '', hash: '' });
  const [failed, setFailed] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const version = packageInfo.version;

  useEffect(() => {
    const abort = new AbortController();
    fetch(`${__LEAF_DOCS_SITE_BASE__}versions.json`, { signal: abort.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Version index unavailable');
        const data = (await response.json()) as DocsVersions;
        if (
          data.schemaVersion !== 1 ||
          data.package !== '@sudden3/leaf-ui' ||
          !Array.isArray(data.versions) ||
          !data.versions.some((release) => release.version === data.latest) ||
          data.versions.some(
            (release) => !/^\d+\.\d+\.\d+$/.test(release.version) || !Array.isArray(release.pages),
          )
        )
          throw new Error('Unsupported version index');
        setManifest(data);
      })
      .catch(() => {
        if (!abort.signal.aborted) setFailed(true);
      });
    return () => abort.abort();
  }, []);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  return (
    <div className="leaf-docs-versions" ref={root}>
      <Button
        ref={trigger}
        variant="ghost"
        size="sm"
        className="leaf-docs-versions__trigger"
        aria-label={english ? `Documentation version ${version}` : `文档版本 ${version}`}
        aria-haspopup="menu"
        aria-expanded={open}
        endIcon={<ChevronDown size={12} />}
        onClick={() => {
          setLocation({ pathname: window.location.pathname, hash: window.location.hash });
          setOpen((value) => !value);
        }}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown') return;
          event.preventDefault();
          setLocation({ pathname: window.location.pathname, hash: window.location.hash });
          setOpen(true);
        }}
      >
        v{version}
      </Button>
      {open && (
        <div
          ref={menu}
          role="menu"
          aria-label={english ? 'Documentation versions' : '文档版本'}
          className="leaf-docs-versions__menu"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setOpen(false);
              trigger.current?.focus();
              return;
            }
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const links = [...(menu.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])];
            const index = links.indexOf(document.activeElement as HTMLAnchorElement);
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? links.length - 1
                  : (index + (event.key === 'ArrowUp' ? -1 : 1) + links.length) % links.length;
            links[next]?.focus();
          }}
        >
          <span className="leaf-docs-versions__caption">
            {english ? 'Published versions' : '已发布版本'}
          </span>
          {manifest?.versions.map((release) => {
            const target = versionTarget(
              __LEAF_DOCS_SITE_BASE__,
              location.pathname,
              location.hash,
              release,
              manifest.latest,
            );
            return (
              <a
                key={release.version}
                href={target.href}
                role="menuitem"
                aria-current={release.version === version ? 'page' : undefined}
                title={
                  target.exact
                    ? undefined
                    : english
                      ? 'Open the available page or overview in this version.'
                      : '将打开该版本可用的页面或总览。'
                }
              >
                <span>v{release.version}</span>
                {release.version === manifest.latest && (
                  <small>{english ? 'Latest' : '最新'}</small>
                )}
              </a>
            );
          })}
          {!manifest && (
            <span role="status" className="leaf-docs-versions__caption">
              {failed
                ? english
                  ? 'Version index unavailable'
                  : '暂时无法获取版本列表'
                : english
                  ? 'Loading…'
                  : '加载中…'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
