import type { SelectOption } from '@ifhover/leaf-ui';
import { Select } from '@ifhover/leaf-ui';

export function ResponsiveTags({ english = false }) {
  const options: SelectOption[] = [
    { value: 'design', label: english ? 'Design' : '设计' },
    { value: 'engineering', label: english ? 'Engineering' : '工程' },
    { value: 'marketing', label: english ? 'Marketing' : '市场' },
    { value: 'operations', label: english ? 'Operations' : '运营' },
  ];
  return (
    <Select
      aria-label={english ? 'Roles' : '角色'}
      defaultValue={['design', 'engineering', 'marketing']}
      maxTagCount="responsive"
      multiple
      options={options}
      placeholder={english ? 'Select roles' : '选择角色'}
    />
  );
}
