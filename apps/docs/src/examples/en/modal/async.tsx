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
        Save title asynchronously
      </Button>
      <Text tone="muted" role="status">
        Saved: {saved}
      </Text>
      <Modal
        open={open}
        title="Edit title"
        confirmText="Save"
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
        <FormField layout="vertical" label="Title">
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
