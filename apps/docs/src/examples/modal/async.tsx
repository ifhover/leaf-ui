import { Button, FormField, Input, Modal, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ModalAsync() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('Leaf UI');
  const [saved, setSaved] = useState('Leaf UI');
  const [saving, setSaving] = useState(false);
  return (
    <Space direction="vertical" align="start">
      <Button
        onClick={() => {
          setDraft(saved);
          setOpen(true);
        }}
      >
        异步保存标题
      </Button>
      <Text tone="muted" role="status">
        已保存：{saved}
      </Text>
      <Modal
        open={open}
        title="编辑标题"
        confirmText="保存"
        onClose={() => setOpen(false)}
        onConfirm={async () => {
          setSaving(true);
          try {
            await new Promise<void>((resolve) => setTimeout(resolve, 900));
            setSaved(draft);
            setOpen(false);
          } finally {
            setSaving(false);
          }
        }}
      >
        <FormField layout="vertical" label="标题">
          <Input
            value={draft}
            disabled={saving}
            onChange={(event) => setDraft(event.target.value)}
          />
        </FormField>
      </Modal>
    </Space>
  );
}
