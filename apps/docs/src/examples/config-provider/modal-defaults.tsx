import { Button, ConfigProvider, Modal, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfigProviderModalDefaults() {
  const [open, setOpen] = useState(false);

  return (
    <ConfigProvider components={{ Modal: { maskClosable: false } }}>
      <Button onClick={() => setOpen(true)}>打开弹窗</Button>
      <Modal open={open} title="点击遮罩不会关闭" onClose={() => setOpen(false)}>
        <Paragraph>
          试着点击弹窗外的遮罩，弹窗会保持打开。仍可通过关闭按钮、底部操作或 Esc 关闭。
        </Paragraph>
      </Modal>
    </ConfigProvider>
  );
}
