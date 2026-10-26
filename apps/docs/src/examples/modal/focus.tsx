import { Button, FormField, Input, Modal } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function ModalFocus() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button onClick={() => setOpen(true)}>聚焦输入框</Button>
      <Modal open={open} title="编辑标题" initialFocus={inputRef} onClose={() => setOpen(false)}>
        <FormField layout="vertical" label="标题">
          <Input ref={inputRef} defaultValue="Leaf UI" />
        </FormField>
      </Modal>
    </>
  );
}
