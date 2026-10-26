import { Splitter, Text } from '@ifhover/leaf-ui';

export function SplitterBasic() {
  return (
    <Splitter
      style={{ height: 240 }}
      panels={[
        { key: 'left', children: <Text>左侧面板</Text> },
        { key: 'right', children: <Text>右侧面板</Text> },
      ]}
    />
  );
}
