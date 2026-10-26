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

export function TagLimit() {
  return (
    <TreeSelect
      aria-label="只展示一个成员标签"
      treeCheckable
      maxTagCount={1}
      options={options}
      defaultValue={['alice', 'bob', 'carol']}
      defaultExpandAll
    />
  );
}
