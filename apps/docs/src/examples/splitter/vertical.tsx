import { Splitter } from '@ifhover/leaf-ui';
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
