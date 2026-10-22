import { Splitter } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function SplitterBasic({ english = false }: { english?: boolean }) {
  const [sizes, setSizes] = useState<readonly number[]>([35, 65]);
  return (
    <Splitter
      style={{ height: 220 }}
      sizes={sizes}
      onResize={setSizes}
      panels={[
        {
          key: 'navigation',
          min: 20,
          max: 55,
          collapsible: true,
          children: (
            <div style={{ padding: 16 }}>
              {english
                ? 'Navigation — drag the divider or use arrow keys.'
                : '导航 — 拖动分隔条或使用方向键调整。'}
            </div>
          ),
        },
        {
          key: 'content',
          min: 30,
          children: <div style={{ padding: 16 }}>{english ? 'Workspace' : '工作区'}</div>,
        },
      ]}
    />
  );
}
