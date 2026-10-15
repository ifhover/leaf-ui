import type { CollapseItem } from '@ifhover/leaf-ui';
import { Collapse, Flex, Input, Space, Text } from '@ifhover/leaf-ui';

const items: CollapseItem[] = [
  { key: 'about', label: '项目介绍', children: <p>Leaf Garden 的项目信息。</p> },
  {
    key: 'settings',
    label: '设置',
    children: <Input aria-label="项目名称" placeholder="输入后折叠，内容会保留" />,
  },
  { key: 'archived', label: '已归档', children: null, disabled: true },
];
export function CollapseBasic() {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm">
        <Text>自由展开</Text>
        <Collapse items={items} defaultActiveKey="about" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>手风琴 · 紧凑尺寸</Text>
        <Collapse items={items} accordion size="sm" />
      </Flex>
    </Space>
  );
}
