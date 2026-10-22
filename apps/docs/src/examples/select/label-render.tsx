import type { SelectOption } from '@ifhover/leaf-ui';
import { Select } from '@ifhover/leaf-ui';

const roles = (english: boolean): SelectOption[] => [
  { value: 'design', label: english ? 'Design' : '设计' },
  { value: 'engineering', label: english ? 'Engineering' : '工程' },
  { value: 'marketing', label: english ? 'Marketing' : '市场' },
  { value: 'operations', label: english ? 'Operations' : '运营' },
];

export function LabelRender({ english = false }) {
  return (
    <Select
      aria-label={english ? 'Role' : '角色'}
      defaultValue="design"
      labelRender={(option) => <strong>{option.label}</strong>}
      options={roles(english)}
      placeholder={english ? 'Select a role' : '选择角色'}
    />
  );
}
