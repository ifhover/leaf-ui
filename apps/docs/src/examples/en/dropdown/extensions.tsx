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
          label: 'View',
          type: 'group',
          children: [
            {
              key: 'list',
              label: 'List',
              type: 'radio',
              group: 'view',
              checked: view === 'list',
              onCheckedChange: () => setView('list'),
            },
            {
              key: 'grid',
              label: 'Grid',
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
          label: 'Show details',
          type: 'checkbox',
          checked,
          onCheckedChange: setChecked,
        },
        {
          key: 'more',
          label: 'More actions',
          children: [
            { key: 'copy', label: 'Copy' },
            { key: 'archive', label: 'Archive' },
          ],
        },
      ]}
    >
      <Button variant="outline">Views and actions</Button>
    </Dropdown>
  );
}
