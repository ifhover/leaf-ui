import { Flex, Text, TreeSelect, type TreeSelectOption } from '@ifhover/leaf-ui';

const treeOptions: readonly TreeSelectOption[] = [
  {
    value: 'design',
    label: '设计团队',
    selectable: false,
    children: [
      { value: 'visual', label: '视觉设计' },
      { value: 'product', label: '产品设计' },
      { value: 'archive', label: '归档团队', disabled: true },
    ],
  },
  {
    value: 'engineering',
    label: '研发团队',
    selectable: false,
    children: [
      { value: 'web', label: '前端开发' },
      { value: 'server', label: '服务端开发' },
    ],
  },
];

export function TreeSelectStates() {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm">
        <Text tone="muted">禁用</Text>
        <TreeSelect aria-label="禁用的团队选择" options={treeOptions} disabled defaultValue="web" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">错误</Text>
        <TreeSelect
          aria-label="有错误的团队选择"
          options={treeOptions}
          status="error"
          placeholder="选择团队"
        />
      </Flex>
    </Flex>
  );
}
