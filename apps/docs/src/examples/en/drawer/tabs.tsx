import { Button, Drawer, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DrawerTabs() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('overview');
  return (
    <>
      <Button onClick={() => setOpen(true)}>Inspect details</Button>
      <Drawer
        open={open}
        title="Task details"
        onClose={() => setOpen(false)}
        tabs={{
          activeKey: view,
          onChange: setView,
          items: [
            { key: 'overview', label: 'Overview' },
            { key: 'logs', label: 'Logs' },
          ],
        }}
      >
        <Text>
          {view === 'overview'
            ? 'Omit item children to use the tab bar as a view switcher for the drawer body.'
            : 'Showing the logs view while keeping the tab bar divider visible.'}
        </Text>
      </Drawer>
    </>
  );
}
