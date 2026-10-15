import { Button, Modal } from '@ifhover/leaf-ui';
import { Save } from 'lucide-react';
import { useState } from 'react';

export function ModalDescription() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Icon and description
      </Button>
      <Modal
        open={open}
        title="Save settings"
        description="Your changes take effect immediately after saving."
        icon={<Save />}
        confirmText="Save"
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      >
        Save the current settings?
      </Modal>
    </>
  );
}
