import { Button, Modal, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ModalCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open card dialog</Button>
      <Modal open={open} variant="card" title="Instructions" onClose={() => setOpen(false)}>
        <Paragraph>
          Documents are saved as drafts and become visible to others after publishing.
        </Paragraph>
      </Modal>
    </>
  );
}
