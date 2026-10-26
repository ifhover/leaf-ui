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

export function TagLimit() {
  return (
    <TreeSelect
      aria-label="Show one member tag"
      treeCheckable
      maxTagCount={1}
      options={options}
      defaultValue={['alice', 'bob', 'carol']}
      defaultExpandAll
    />
  );
}
