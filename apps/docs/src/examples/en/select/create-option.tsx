import { Select, type SelectOption } from '@ifhover/leaf-ui';
import { useState } from 'react';

const initialOptions: SelectOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
];

export function CreateOption() {
  const [options, setOptions] = useState(initialOptions);
  const [value, setValue] = useState<string[]>(['design']);
  return (
    <Select
      aria-label="Project tags"
      multiple
      allowCreate
      options={options}
      value={value}
      onChange={setValue}
      onCreate={(option) => setOptions((current) => [...current, option])}
      placeholder="Select or type a new tag"
    />
  );
}
