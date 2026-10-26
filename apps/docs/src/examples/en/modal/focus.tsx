import { Button, FormField, Input, Modal } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function ModalFocus() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Focus the input</Button>
      <Modal open={open} title="Edit title" initialFocus={inputRef} onClose={() => setOpen(false)}>
        <FormField layout="vertical" label="Title">
          <Input ref={inputRef} defaultValue="Leaf UI" />
        </FormField>
      </Modal>
    </>
  );
}
