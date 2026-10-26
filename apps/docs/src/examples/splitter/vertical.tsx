import { Splitter, Text } from '@ifhover/leaf-ui';

export function SplitterVertical() {
  return (
    <Splitter
      direction="vertical"
      style={{ height: 240 }}
      panels={[
        { key: 'top', children: <Text>上方面板</Text> },
        { key: 'bottom', children: <Text>下方面板</Text> },
      ]}
    />
  );
}
