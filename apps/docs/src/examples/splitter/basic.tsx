import { Splitter } from '@sudden3/leaf-ui';
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
export function SplitterVertical({ english = false }: { english?: boolean }) {
  return (
    <Splitter
      direction="vertical"
      style={{ height: 240 }}
      defaultSizes={[60, 40]}
      panels={[
        {
          key: 'editor',
          min: 25,
          children: <div style={{ padding: 16 }}>{english ? 'Editor' : '编辑器'}</div>,
        },
        {
          key: 'output',
          min: 15,
          children: <div style={{ padding: 16 }}>{english ? 'Output' : '输出内容'}</div>,
        },
      ]}
    />
  );
}
