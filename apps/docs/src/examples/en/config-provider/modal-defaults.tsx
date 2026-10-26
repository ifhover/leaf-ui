import { Button, ConfigProvider, Modal, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfigProviderModalDefaults() {
  const [open, setOpen] = useState(false);
  return (
    <ConfigProvider components={{ Modal: { maskClosable: false } }}>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Modal open={open} title="Keep current content" onClose={() => setOpen(false)}>
        <Paragraph>
          Clicking the mask keeps this dialog open. Use the close button, footer actions or Escape
          to close it.
        </Paragraph>
      </Modal>
    </ConfigProvider>
  );
}
