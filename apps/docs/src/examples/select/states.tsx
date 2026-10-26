import { Flex, Select, Text } from '@ifhover/leaf-ui';

const options = [
  { value: 'design', label: '设计工作室' },
  { value: 'product', label: '产品团队' },
  { value: 'engineering', label: '工程团队' },
  { value: 'archived', label: '归档项目', disabled: true },
];

export function SelectStates() {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm">
        <Text tone="muted">禁用</Text>
        <Select aria-label="禁用的团队选择" options={options} defaultValue="design" disabled />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">加载中</Text>
        <Select aria-label="正在加载的团队" options={[]} loading placeholder="加载中" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">空选项</Text>
        <Select
          aria-label="暂无可选团队"
          options={[]}
          notFoundContent="还没有团队"
          placeholder="暂无团队"
        />
      </Flex>
    </Flex>
  );
}
