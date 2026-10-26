import { Button, Modal, Paragraph, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ModalFooter() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>自定义底部</Button>
      <Modal
        open={open}
        title="草稿说明"
        onClose={() => setOpen(false)}
        footer={({ cancelButton, confirmButton }) => (
          <Space wrap>
            <Button variant="text" onClick={() => setDetails(!details)}>
              {details ? '收起详情' : '查看详情'}
            </Button>
            {cancelButton}
            {confirmButton}
          </Space>
        )}
      >
        <Paragraph>新文档会保存为草稿，之后仍可修改内容。</Paragraph>
        {details && <Paragraph>草稿只对你可见，发布后才会与其他人共享。</Paragraph>}
      </Modal>
    </>
  );
}
