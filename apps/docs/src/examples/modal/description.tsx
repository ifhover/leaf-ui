import { Button, Modal } from '@ifhover/leaf-ui';
import { Save } from 'lucide-react';
import { useState } from 'react';

export function ModalDescription() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        带图标与说明
      </Button>
      <Modal
        open={open}
        title="保存设置"
        description="保存后，新设置将立即生效。"
        icon={<Save />}
        confirmText="保存"
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      >
        确认保存当前设置？
      </Modal>
    </>
  );
}
