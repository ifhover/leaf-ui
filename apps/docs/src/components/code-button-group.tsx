import { Button } from '@ifhover/leaf-ui';
import { type CodeButtonGroupProps, getCopyableText } from '@rspress/core/theme-original';
import { CopyButton } from './copy-button';
import { useDocsLocale } from './i18n';
import { Icon } from './icon';

export function CodeButtonGroup({
  copyElementRef,
  wrapCode,
  toggleWrapCode,
  showWrapCodeButton = true,
  showCopyButton = true,
}: CodeButtonGroupProps) {
  const { t } = useDocsLocale();
  return (
    <div className="rp-code-button-group leaf-docs-code-actions">
      {showWrapCodeButton && (
        <Button
          size="sm"
          aria-label={t('切换代码换行', 'Toggle line wrapping')}
          title={t('切换代码换行', 'Toggle line wrapping')}
          aria-pressed={wrapCode}
          onClick={toggleWrapCode}
          startIcon={<Icon name="wrap" />}
        />
      )}
      {showCopyButton && (
        <CopyButton
          text={() => getCopyableText(copyElementRef.current)}
          label={t('复制代码', 'Copy code')}
          iconOnly
        />
      )}
    </div>
  );
}
