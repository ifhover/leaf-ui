import { Button, Flex, Text, TreeSelect, type TreeSelectOption } from '@ifhover/leaf-ui';
import { useState } from 'react';

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

export function TreeSelectControlled() {
  const [value, setValue] = useState<string | null>('visual');
  return (
    <Flex direction="column" gap="sm">
      <TreeSelect
        aria-label="受控团队"
        options={treeOptions}
        value={value}
        onChange={setValue}
        defaultExpandAll
        placeholder="选择团队"
      />
      <Text tone="muted" role="status">
        当前值：{value ?? '未选择'}
      </Text>
      <Flex>
        <Button variant="outline" onClick={() => setValue('visual')}>
          重置
        </Button>
      </Flex>
    </Flex>
  );
}
