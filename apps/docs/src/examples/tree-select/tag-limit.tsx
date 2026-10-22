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

export function TagLimit({ english = false }) {
  return (
    <TreeSelect
      aria-label={english ? 'Team members' : '团队成员'}
      maxTagCount={1}
      options={options(english)}
      placeholder={english ? 'Only one tag is shown' : '只展示一个标签'}
      treeCheckable
    />
  );
}
