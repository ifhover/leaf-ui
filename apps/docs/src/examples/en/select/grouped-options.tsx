import { Select, type SelectOptionGroup } from '@ifhover/leaf-ui';

const options: SelectOptionGroup[] = [
  {
    label: 'Design',
    options: [
      { value: 'ui', label: 'Interface design' },
      { value: 'ux', label: 'Experience design' },
    ],
  },
  {
    label: 'Engineering',
    options: [{ value: 'web', label: 'Frontend development' }],
  },
];

export function GroupedOptions() {
  return <Select aria-label="Discipline" options={options} placeholder="Select a discipline" />;
}
