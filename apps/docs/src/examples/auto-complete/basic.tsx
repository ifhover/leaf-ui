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
          placeholder="输入 Leaf 或自由填写"
          options={options}
          value={value}
          onChange={setValue}
          onSelect={setSelected}
        />
      </FormField>
      <Text tone="muted">
        输入：{value || '空'} · 最近选中：{selected || '无'}
      </Text>
      <FormField label="禁用建议">
        <AutoComplete aria-label="禁用建议" options={options} disabled defaultValue="Leaf Garden" />
      </FormField>
    </Form>
  );
}
