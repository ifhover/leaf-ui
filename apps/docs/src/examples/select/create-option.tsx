import type { SelectOption } from '@ifhover/leaf-ui';
import { Select } from '@ifhover/leaf-ui';

const roles = (english: boolean): SelectOption[] => [
  { value: 'design', label: english ? 'Design' : '设计' },
  { value: 'engineering', label: english ? 'Engineering' : '工程' },
  { value: 'marketing', label: english ? 'Marketing' : '市场' },
];

export function CreateOption({ english = false }) {
  return (
    <Select
      allowCreate
      aria-label={english ? 'Tags' : '标签'}
      multiple
      options={roles(english)}
      placeholder={english ? 'Select or type to create' : '选择或输入创建'}
      showSearch
    />
  );
}
