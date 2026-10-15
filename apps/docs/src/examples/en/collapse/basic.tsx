import type { CollapseItem } from '@ifhover/leaf-ui';
import { Collapse, Flex, Input, Space, Text } from '@ifhover/leaf-ui';

const items: CollapseItem[] = [
  { key: 'about', label: 'About the project', children: <p>About Leaf Garden.</p> },
  {
    key: 'settings',
    label: 'Settings',
    children: (
      <Flex direction="column" gap="sm" align="start">
        <Text>Project name</Text>
        <Input aria-label="Project name" placeholder="Type a draft, then collapse to keep it" />
      </Flex>
    ),
  },
  { key: 'archived', label: 'Archived', children: null, disabled: true },
];
export function CollapseBasic() {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm">
        <Text>Expand freely</Text>
        <Collapse items={items} defaultActiveKey="about" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>Accordion · Compact</Text>
        <Collapse items={items} accordion size="sm" />
      </Flex>
    </Space>
  );
}
