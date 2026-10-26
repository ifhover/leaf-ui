import { Flex, Select, Text } from '@ifhover/leaf-ui';

const options = [
  { value: 'design', label: '一个名称比较长的产品设计团队' },
  { value: 'web', label: '前端开发' },
  { value: 'server', label: '服务端开发' },
  { value: 'operations', label: '日常运营' },
];
const selected = options.map((option) => option.value);

export function SingleLine() {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm">
        <Text tone="muted">默认换行</Text>
        <Select
          aria-label="允许换行的团队标签"
          multiple
          options={options}
          defaultValue={selected}
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">单行显示</Text>
        <Select
          aria-label="单行团队标签"
          multiple
          tagWrap={false}
          options={options}
          defaultValue={selected}
        />
      </Flex>
    </Flex>
  );
}
