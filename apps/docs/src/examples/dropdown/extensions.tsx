import { Button, Dropdown } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function ExtensionDemo() {
  const [checked, setChecked] = useState(true);
  const [view, setView] = useState('list');
  return (
    <Dropdown
      items={[
        {
          key: 'group',
          label: '视图',
          type: 'group',
          children: [
            {
              key: 'list',
              label: '列表',
              type: 'radio',
              group: 'view',
              checked: view === 'list',
              onCheckedChange: () => setView('list'),
            },
            {
              key: 'grid',
              label: '网格',
              type: 'radio',
              group: 'view',
              checked: view === 'grid',
              onCheckedChange: () => setView('grid'),
            },
          ],
        },
        { key: 'line', type: 'divider' },
        {
          key: 'detail',
          label: '显示详情',
          type: 'checkbox',
          checked,
          onCheckedChange: setChecked,
        },
        {
          key: 'more',
          label: '更多操作',
          children: [
            { key: 'copy', label: '复制' },
            { key: 'archive', label: '归档' },
          ],
        },
      ]}
    >
      <Button variant="outline">视图与操作</Button>
    </Dropdown>
  );
}
