import { Button, Input, Modal } from '@sudden3/leaf-ui';
import { useRef, useState } from 'react';
export function Capabilities({ english = false }) {
  const [open, setOpen] = useState(false);
  const focus = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{english ? 'Open editor' : '打开编辑器'}</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={english ? 'Disposable draft' : '临时草稿'}
        destroyOnClose
        initialFocus={focus}
        footer={({ cancelButton, confirmButton }) => (
          <>
            {cancelButton}
            {confirmButton}
          </>
        )}
      >
        <Input
          ref={focus}
          aria-label={english ? 'Draft title' : '草稿标题'}
          placeholder={english ? 'The draft resets after closing' : '关闭后不保留草稿'}
        />
      </Modal>
    </>
  );
}
