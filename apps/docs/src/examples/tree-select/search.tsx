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

export function Search({ english = false }) {
  return (
    <TreeSelect
      aria-label={english ? 'Team members' : '团队成员'}
      filterTreeNode={(node, query) =>
        String(node.label).toLowerCase().includes(query.toLowerCase())
      }
      options={options(english)}
      placeholder={english ? 'Search a teammate' : '搜索成员'}
      showSearch
    />
  );
}
