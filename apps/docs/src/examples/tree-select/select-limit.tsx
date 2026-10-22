import { TreeSelect } from '@ifhover/leaf-ui';

const options = (english: boolean) => [
  {
    value: 'team',
    label: english ? 'Team' : '团队',
    children: [
      { value: 'alice', label: 'Alice' },
      { value: 'bob', label: 'Bob' },
      { value: 'carol', label: 'Carol' },
    ],
  },
];

export function SelectLimit({ english = false }) {
  return (
    <TreeSelect
      aria-label={english ? 'Team members' : '团队成员'}
      maxCount={2}
      options={options(english)}
      placeholder={english ? 'Choose up to two people' : '最多选择两人'}
      treeCheckable
    />
  );
}
