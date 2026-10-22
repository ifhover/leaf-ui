import { AutoComplete, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = [
  { value: 'Leaf Garden' },
  { value: 'Leaf Studio' },
  { value: 'Pine Forest' },
  { value: 'Archived Garden', disabled: true },
];

export function AutoCompleteBasic() {
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState('');
  return (
    <Form layout="vertical">
      <FormField label="项目名称">
        <AutoComplete
          aria-label="项目名称"
          onChange={setValue}
          onSelect={setSelected}
          options={options}
          placeholder="输入 Leaf 或自由填写"
          value={value}
        />
      </FormField>
      <Text tone="muted">
        输入：{value || '空'} · 最近选中：{selected || '无'}
      </Text>
      <FormField label="禁用整个控件">
        <AutoComplete
          aria-label="禁用整个控件"
          defaultValue="Leaf Garden"
          disabled
          options={options}
        />
      </FormField>
    </Form>
  );
}
