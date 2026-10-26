import { TreeSelect } from '@ifhover/leaf-ui';

const options = [
  {
    value: 'team',
    label: '团队',
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
      aria-label="按内容定宽的成员选择"
      options={options}
      popupWidth="auto"
      popupMaxWidth={320}
      defaultExpandAll
      placeholder="选择成员"
    />
  );
}
