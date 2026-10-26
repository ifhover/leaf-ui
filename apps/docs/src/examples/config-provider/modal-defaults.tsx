import { Button, ConfigProvider, Modal, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfigProviderModalDefaults() {
  const [open, setOpen] = useState(false);
  return (
    <ConfigProvider components={{ Modal: { maskClosable: false } }}>
      <Button onClick={() => setOpen(true)}>打开弹窗</Button>
      <Modal open={open} title="保留当前内容" onClose={() => setOpen(false)}>
        <Paragraph>点击遮罩不会关闭。使用关闭按钮、底部操作或 Escape 关闭。</Paragraph>
      </Modal>
    </ConfigProvider>
  );
}
