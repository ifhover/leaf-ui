import { Button } from '@sudden3/leaf-ui';
import { useEffect, useState } from 'react';
import { Icon } from './icon';

export function CopyButton({
  text,
  label = '复制',
}: {
  text: string | (() => string);
  label?: string;
}) {
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

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={copy}
      startIcon={<Icon name={status === 'copied' ? 'check' : 'copy'} />}
      aria-live="polite"
    >
      {status === 'copied' ? '已复制' : status === 'error' ? '复制失败，请手动复制' : label}
    </Button>
  );
}
