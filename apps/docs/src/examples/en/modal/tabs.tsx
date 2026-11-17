import { Button, Modal, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ModalTabs() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Project settings</Button>
      <Modal
        open={open}
        title="Project settings"
        divided={false}
        onClose={() => setOpen(false)}
        tabs={{
          items: [
            {
              key: 'general',
              label: 'General',
              children: <Text>Display settings forms or details in separate tab panels.</Text>,
            },
            {
              key: 'members',
              label: 'Permissions',
              children: <Text>The tab bar stays fixed while only the body scrolls.</Text>,
            },
          ],
        }}
      />
    </>
  );
}
