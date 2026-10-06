import type { SearchButtonProps } from '@rspress/core/theme-original';
import { Button } from '@sudden3/leaf-ui';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDocsLocale } from './i18n';

export function SearchButton({ setFocused }: SearchButtonProps) {
  const { t } = useDocsLocale();
  const [shortcut, setShortcut] = useState<string>();
  useEffect(() => {
    setShortcut(/Mac|iPhone|iPod|iPad/i.test(navigator.platform) ? '⌘K' : 'Ctrl K');
  }, []);

  const label = t('搜索文档', 'Search documentation');
  return (
    <>
      <Button
        className="leaf-docs-search-button"
        variant="outline"
        aria-label={label}
        aria-keyshortcuts="Control+K Meta+K"
        startIcon={<Search />}
        endIcon={<kbd>{shortcut}</kbd>}
        onClick={() => setFocused(true)}
      >
        {label}
      </Button>
      <Button
        className="leaf-docs-search-mobile"
        variant="ghost"
        aria-label={label}
        startIcon={<Search />}
        onClick={() => setFocused(true)}
      />
    </>
  );
}
