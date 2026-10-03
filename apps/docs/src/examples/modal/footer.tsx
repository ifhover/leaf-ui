import { Button, Modal } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function ModalFooter() {
  const [open, setOpen] = useState(false);
  const [extra, setExtra] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        自定义底部
      </Button>
      <Modal
        open={open}
        title="扩展操作"
        onClose={() => setOpen(false)}
        footer={({ cancelButton, confirmButton }) => (
          <>
            <Button
              variant="ghost"
              style={{ marginRight: 'auto' }}
              onClick={() => setExtra(!extra)}
            >
              查看详情
            </Button>
            {cancelButton}
            {confirmButton}
          </>
        )}
      >
        <p>通过底部函数增加操作，保留默认取消与确定按钮。</p>
        {extra && <p>这里展示额外的信息。</p>}
      </Modal>
    </>
  );
}
