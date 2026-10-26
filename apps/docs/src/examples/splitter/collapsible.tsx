import { Splitter, Text } from '@ifhover/leaf-ui';

export function SplitterCollapsible() {
  return (
    <Splitter
      style={{ height: 240 }}
      defaultSizes={[35, 65]}
      panels={[
        { key: 'left', collapsible: true, children: <Text>左侧面板</Text> },
        { key: 'right', children: <Text>右侧面板</Text> },
      ]}
    />
  );
}
