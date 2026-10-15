import { Cascader, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
import { regions } from './options';

export function CascaderControlled() {
  const [value, setValue] = useState<string[]>(['zhejiang', 'hangzhou', 'xihu']);
  return (
    <Form layout="vertical">
      <FormField label="收货地区">
        <Cascader aria-label="收货地区" options={regions} value={value} onChange={setValue} />
      </FormField>
      <Text tone="muted">选中路径：{value.join(' → ') || '未选择'}</Text>
    </Form>
  );
}
