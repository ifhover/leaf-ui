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

export function NodeRender({ english = false }) {
  return (
    <TreeSelect
      aria-label={english ? 'Team members' : '团队成员'}
      nodeRender={(node) => <strong>{node.label}</strong>}
      options={options(english)}
      placeholder={english ? 'Bold node labels' : '节点名称加粗'}
    />
  );
}
