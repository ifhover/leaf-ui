import { Form, FormField, Select, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SelectControlled() {
  const [value, setValue] = useState('');
  return (
    <Form layout="vertical">
      <FormField label="项目可见性">
        <Select
          aria-label="项目可见性"
          value={value}
          placeholder="选择可见性"
          allowClear
          onChange={setValue}
          options={[
            { label: '公开', value: 'public' },
            { label: '团队', value: 'team' },
            { label: '私密', value: 'private' },
          ]}
        />
      </FormField>
      <Text tone="muted">当前值：{value || '尚未选择'}</Text>
      <FormField label="未设置团队 · 错误">
        <Select
          aria-label="未设置团队"
          status="error"
          placeholder="请选择所属团队"
          options={[{ label: '设计团队', value: 'design' }]}
        />
      </FormField>
    </Form>
  );
}
