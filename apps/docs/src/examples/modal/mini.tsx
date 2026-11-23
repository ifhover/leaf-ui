import { Button, Modal } from '@ifhover/leaf-ui';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export function ModalMini() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        删除会话
      </Button>
      <Modal
        open={open}
        size="mini"
        danger
        icon={<Trash2 />}
        title="确认删除该会话？"
        description="删除后将永久清除这段对话记录及关联记忆，无法恢复。"
        confirmText="删除"
        onConfirm={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
