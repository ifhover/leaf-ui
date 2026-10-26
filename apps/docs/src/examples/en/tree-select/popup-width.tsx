import { TreeSelect } from '@ifhover/leaf-ui';

const options = [
  {
    value: 'team',
    label: 'Team',
    children: [
      { value: 'alice', label: 'Alice' },
      { value: 'bob', label: 'Bob' },
      { value: 'carol', label: 'Carol' },
    ],
  },
];

export function PopupWidth() {
  return (
    <TreeSelect
      aria-label="Content-sized member selection"
      options={options}
      popupWidth="auto"
      popupMaxWidth={320}
      defaultExpandAll
      placeholder="Select a member"
    />
  );
}
