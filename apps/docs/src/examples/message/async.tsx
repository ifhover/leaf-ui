import { Button, useMessage } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function MessageAsync() {
  const { message } = useMessage();
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    const key = message.loading('正在保存');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    message.open({ key, type: 'success', content: '保存成功' });
    setSaving(false);
  }
  return (
    <Button loading={saving} onClick={save}>
      异步保存
    </Button>
  );
}
