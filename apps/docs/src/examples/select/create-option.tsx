import { Select, type SelectOption } from '@ifhover/leaf-ui';
import { useState } from 'react';

const initialOptions: SelectOption[] = [
  { value: 'design', label: '设计' },
  { value: 'engineering', label: '工程' },
];

export function CreateOption() {
  const [options, setOptions] = useState(initialOptions);
  const [value, setValue] = useState<string[]>(['design']);
  return (
    <Select
      aria-label="项目标签"
      multiple
      allowCreate
      options={options}
      value={value}
      onChange={setValue}
      onCreate={(option) => setOptions((current) => [...current, option])}
      placeholder="选择或输入新标签"
    />
  );
}
