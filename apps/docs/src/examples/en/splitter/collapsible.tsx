import { Splitter, Text } from '@ifhover/leaf-ui';

export function SplitterCollapsible() {
  return (
    <Splitter
      style={{ height: 240 }}
      defaultSizes={[35, 65]}
      panels={[
        { key: 'left', collapsible: true, children: <Text>Left panel</Text> },
        { key: 'right', children: <Text>Right panel</Text> },
      ]}
    />
  );
}
