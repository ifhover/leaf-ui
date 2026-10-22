import { Input, Space, Tree, type TreeNode } from '@ifhover/leaf-ui';
import { Search } from 'lucide-react';
import { useState } from 'react';

const treeData: readonly TreeNode[] = [
  {
    key: 'design',
    title: 'Design resources',
    children: [
      { key: 'components', title: 'Component guidelines' },
      { key: 'colors', title: 'Brand colors' },
    ],
  },
  {
    key: 'engineering',
    title: 'Engineering',
    children: [{ key: 'web', title: 'Website' }],
  },
];

export function TreeSearch() {
  const [query, setQuery] = useState('');
  return (
    <Space direction="vertical" align="stretch">
      <Input
        aria-label="Search nodes"
        placeholder="Search nodes"
        prefix={<Search />}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        allowClear
      />
      <Tree data={treeData} searchValue={query} showIcon />
    </Space>
  );
}
