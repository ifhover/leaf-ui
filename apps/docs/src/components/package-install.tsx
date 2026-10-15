import { Tabs } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';
import { Children, isValidElement, type ReactNode, useEffect, useState } from 'react';
import { CopyButton } from './copy-button';
import { useDocsLocale } from './i18n';
import './package-install.scss';

const packageManagers = [
  { key: 'npm', label: 'npm', action: 'install' },
  { key: 'yarn', label: 'Yarn', action: 'add' },
  { key: 'pnpm', label: 'pnpm', action: 'add' },
  { key: 'bun', label: 'Bun', action: 'add' },
] as const;

const storageKey = 'leaf-ui-docs-package-manager';
const changeEvent = 'leaf-ui-docs-package-manager-change';

function usePackageManager() {
  // Match the static HTML before restoring the browser's preference.
  const [manager, setManager] = useState('pnpm');

  useEffect(() => {
    const restore = (value: unknown) => {
      setManager(packageManagers.find((item) => item.key === value)?.key ?? 'pnpm');
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) restore(event.newValue);
    };
    const syncPage = (event: Event) => {
      if (event instanceof CustomEvent) restore(event.detail);
    };

    try {
      restore(window.localStorage.getItem(storageKey));
    } catch {
      // The tabs still work when browser storage is unavailable.
    }
    window.addEventListener('storage', syncStorage);
    window.addEventListener(changeEvent, syncPage);
    return () => {
      window.removeEventListener('storage', syncStorage);
      window.removeEventListener(changeEvent, syncPage);
    };
  }, []);

  function selectManager(key: string) {
    const selection = packageManagers.find((item) => item.key === key);
    if (!selection) return;
    setManager(selection.key);
    try {
      window.localStorage.setItem(storageKey, selection.key);
    } catch {
      // Changing the selection must not depend on persistence.
    }
    window.dispatchEvent(new CustomEvent(changeEvent, { detail: selection.key }));
  }

  return { manager, selectManager };
}

export function PackageInstall({
  variant = 'guide',
  children,
}: {
  variant?: 'guide' | 'hero';
  children?: ReactNode;
}) {
  const { t } = useDocsLocale();
  const { manager, selectManager } = usePackageManager();
  // Rspress passes the original fences as one string when exporting Markdown.
  if (typeof children === 'string') return <>{children}</>;
  const panels = Children.toArray(children).filter(isValidElement);

  return (
    <div className="leaf-package-install rp-not-doc" data-variant={variant}>
      <Tabs
        aria-label={t('选择包管理器', 'Choose a package manager')}
        activeKey={manager}
        onChange={selectManager}
        size="md"
        overflow={false}
        destroyInactive
        items={packageManagers.map((manager, index) => {
          const command = `${manager.key} ${manager.action} @ifhover/leaf-ui`;
          return {
            key: manager.key,
            label: manager.label,
            icon: (
              <img
                src={withBase(`/package-managers/${manager.key}.svg`)}
                alt=""
                width={18}
                height={18}
                aria-hidden="true"
                data-no-zoom=""
              />
            ),
            children: panels[index] ?? (
              <div className="leaf-package-install__command">
                <span className="leaf-package-install__prompt" aria-hidden="true">
                  $
                </span>
                <code>
                  <span>{manager.key}</span> {manager.action} @ifhover/leaf-ui
                </code>
                <CopyButton
                  text={command}
                  label={t('复制安装命令', 'Copy install command')}
                  iconOnly
                />
              </div>
            ),
          };
        })}
      />
    </div>
  );
}
