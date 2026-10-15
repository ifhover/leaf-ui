import { Button, ConfigProvider, Modal, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfigProviderModalDefaults() {
  const [open, setOpen] = useState(false);

  return (
    <ConfigProvider components={{ Modal: { maskClosable: false } }}>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} title="Mask clicks keep this open" onClose={() => setOpen(false)}>
        <Paragraph>
          Try clicking outside the modal. It stays open. The close button, footer actions and Esc
          still close it.
        </Paragraph>
      </Modal>
    </ConfigProvider>
  );
}
