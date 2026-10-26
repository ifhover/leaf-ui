import { Button, useMessage } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function MessageAsync() {
  const { message } = useMessage();
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    const key = message.loading('Saving');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    message.open({ key, type: 'success', content: 'Changes saved' });
    setSaving(false);
  }
  return (
    <Button loading={saving} onClick={save}>
      Save asynchronously
    </Button>
  );
}
