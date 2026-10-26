import { Button, Modal, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ModalCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开卡片弹窗</Button>
      <Modal open={open} variant="card" title="使用说明" onClose={() => setOpen(false)}>
        <Paragraph>文档会自动保存为草稿，发布后才会对其他人可见。</Paragraph>
      </Modal>
    </>
  );
}
