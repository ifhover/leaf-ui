import { Button } from '@ifhover/leaf-ui';
import { ThemeContext } from '@rspress/core/runtime';
import { Moon, Sun } from 'lucide-react';
import { useContext } from 'react';
import { useDocsLocale } from './i18n';

export function SwitchAppearance({ onClick }: { onClick?: () => void }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const { t } = useDocsLocale();
  const dark = theme === 'dark';
  return (
    <Button
      className="leaf-docs-theme-button"
      size="sm"
      aria-label={t(
        dark ? '切换到浅色主题' : '切换到深色主题',
        dark ? 'Switch to light theme' : 'Switch to dark theme',
      )}
      startIcon={dark ? <Moon /> : <Sun />}
      onClick={() => {
        setTheme?.(dark ? 'light' : 'dark');
        onClick?.();
      }}
    />
  );
}
