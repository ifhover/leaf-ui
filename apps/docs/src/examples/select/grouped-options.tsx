import type { SelectOptionGroup } from '@ifhover/leaf-ui';
import { Select } from '@ifhover/leaf-ui';

const groups = (english: boolean): SelectOptionGroup[] => [
  {
    label: english ? 'Design' : '设计',
    options: [
      { value: 'ui', label: english ? 'Interface design' : '界面设计' },
      { value: 'ux', label: english ? 'Experience design' : '体验设计' },
    ],
  },
  {
    label: english ? 'Engineering' : '工程',
    options: [{ value: 'web', label: english ? 'Frontend' : '前端开发' }],
  },
];

export function GroupedOptions({ english = false }) {
  return (
    <Select
      aria-label={english ? 'Discipline' : '专业方向'}
      options={groups(english)}
      placeholder={english ? 'Select a discipline' : '选择专业方向'}
    />
  );
}
