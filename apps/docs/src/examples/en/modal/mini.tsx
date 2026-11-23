import { Button, Modal } from '@ifhover/leaf-ui';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export function ModalMini() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete chat
      </Button>
      <Modal
        open={open}
        size="mini"
        danger
        icon={<Trash2 />}
        title="Delete chat?"
        description="This will permanently delete this chat conversation and its saved memories."
        confirmText="Delete"
        onConfirm={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
