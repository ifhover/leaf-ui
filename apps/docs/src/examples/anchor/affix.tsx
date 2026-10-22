import { Affix, Button } from '@ifhover/leaf-ui';
import { useCallback, useRef } from 'react';
export function AnchorAffix({ english = false }: { english?: boolean }) {
  const scroll = useRef<HTMLDivElement>(null);
  const container = useCallback(() => scroll.current ?? window, []);
  return (
    <div
      ref={scroll}
      style={{
        height: 200,
        overflow: 'auto',
        background: 'var(--leaf-color-surface-muted)',
        padding: 16,
        borderRadius: 'var(--leaf-radius)',
      }}
    >
      <p>{english ? 'Scroll to keep the action visible.' : '向下滚动，操作按钮会保持可见。'}</p>
      <Affix container={container} offsetTop={8}>
        <Button>{english ? 'Save changes' : '保存修改'}</Button>
      </Affix>
      <div style={{ height: 450 }} />
    </div>
  );
}
