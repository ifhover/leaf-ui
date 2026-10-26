import { Button, Dropdown, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DropdownHierarchy() {
  const [action, setAction] = useState('');
  return (
    <Flex direction="column" gap="md" align="start">
      <Dropdown
        onSelect={setAction}
        items={[
          {
            key: 'project',
            type: 'group',
            label: '项目',
            children: [
              { key: 'open', label: '打开' },
              {
                key: 'export',
                label: '导出',
                children: [
                  { key: 'csv', label: 'CSV' },
                  { key: 'json', label: 'JSON' },
                ],
              },
            ],
          },
          { key: 'divider', type: 'divider' },
          { key: 'archive', label: '归档', disabled: true },
          { key: 'delete', label: '删除', danger: true },
        ]}
      >
        <Button variant="outline">项目操作</Button>
      </Dropdown>
      {action && <Text role="status">已选择: {action}</Text>}
    </Flex>
  );
}
