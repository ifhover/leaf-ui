import { Splitter, Text } from '@ifhover/leaf-ui';

export function SplitterVertical() {
  return (
    <Splitter
      direction="vertical"
      style={{ height: 240 }}
      panels={[
        { key: 'top', children: <Text>Top panel</Text> },
        { key: 'bottom', children: <Text>Bottom panel</Text> },
      ]}
    />
  );
}
