import { Button, Modal } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function ModalFooter() {
  const [open, setOpen] = useState(false);
  const [extra, setExtra] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Custom footer
      </Button>
      <Modal
        open={open}
        title="More actions"
        onClose={() => setOpen(false)}
        footer={({ cancelButton, confirmButton }) => (
          <>
            <Button variant="soft" style={{ marginRight: 'auto' }} onClick={() => setExtra(!extra)}>
              Details
            </Button>
            {cancelButton}
            {confirmButton}
          </>
        )}
      >
        <p>Extend the footer while keeping the default actions.</p>
        {extra && <p>Additional details are shown here.</p>}
      </Modal>
    </>
  );
}
