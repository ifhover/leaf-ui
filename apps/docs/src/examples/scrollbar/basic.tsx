import { Button, Scrollbar } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function ScrollbarBasic({ english = false }: { english?: boolean }) {
  return (
    <Scrollbar height={200} aria-label={english ? 'Project activity' : '项目动态'}>
      {Array.from({ length: 12 }, (_, index) => (
        <div key={String(index)} style={{ padding: '12px 20px' }}>
          {english ? 'Project activity' : '项目动态'} {index + 1}
        </div>
      ))}
    </Scrollbar>
  );
}

export function ScrollbarHorizontal({ english = false }: { english?: boolean }) {
  return (
    <Scrollbar
      orientation="horizontal"
      scrollbar="always"
      aria-label={english ? 'Project board' : '项目看板'}
    >
      <div style={{ display: 'flex', width: 'max-content', gap: 16, padding: '12px 12px 24px' }}>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={String(index)}
            style={{
              width: 180,
              padding: 24,
              borderRadius: 'var(--leaf-radius)',
              background: 'var(--leaf-color-surface-muted)',
            }}
          >
            {english ? 'Project' : '项目'} {index + 1}
          </div>
        ))}
      </div>
    </Scrollbar>
  );
}

export function ScrollbarDynamic({ english = false }: { english?: boolean }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(3);
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <Button variant="outline" onClick={() => setCount((previous) => previous + 3)}>
          {english ? 'Add items' : '增加内容'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => viewport.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          {english ? 'Back to top' : '返回顶部'}
        </Button>
      </div>
      <Scrollbar ref={viewport} maxHeight={200} aria-label={english ? 'Dynamic list' : '动态列表'}>
        {Array.from({ length: count }, (_, index) => (
          <div key={String(index)} style={{ padding: '12px 20px' }}>
            {english ? 'Item' : '条目'} {index + 1}
          </div>
        ))}
      </Scrollbar>
    </div>
  );
}
