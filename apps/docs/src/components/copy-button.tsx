import { Button } from '@sudden3/leaf-ui';
import { useEffect, useState } from 'react';
import { useDocsLocale } from './i18n';
import { Icon } from './icon';

export function CopyButton({
  text,
  label,
  iconOnly = false,
}: {
  text: string | (() => string);
  label?: string;
  iconOnly?: boolean;
}) {
  const { t } = useDocsLocale();
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(typeof text === 'function' ? text() : text);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }

  const description =
    status === 'copied'
      ? t('已复制', 'Copied')
      : status === 'error'
        ? t('复制失败，请手动复制', 'Copy failed; copy manually')
        : (label ?? t('复制', 'Copy'));

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={copy}
      startIcon={<Icon name={status === 'copied' ? 'check' : 'copy'} />}
      aria-live="polite"
      aria-label={iconOnly ? description : undefined}
      title={iconOnly ? description : undefined}
    >
      {iconOnly ? undefined : description}
    </Button>
  );
}
