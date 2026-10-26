import { Splitter, Text } from '@ifhover/leaf-ui';

export function SplitterBasic() {
  return (
    <Splitter
      style={{ height: 240 }}
      panels={[
        { key: 'left', children: <Text>Left panel</Text> },
        { key: 'right', children: <Text>Right panel</Text> },
      ]}
    />
  );
}
