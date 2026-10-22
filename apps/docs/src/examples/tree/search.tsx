import { Input, Space, Tree, type TreeNode } from '@ifhover/leaf-ui';
import { Search } from 'lucide-react';
import { useState } from 'react';

const treeData: readonly TreeNode[] = [
  {
    key: 'design',
    title: '设计资源',
    children: [
      { key: 'components', title: '组件规范' },
      { key: 'colors', title: '品牌颜色' },
    ],
  },
  {
    key: 'engineering',
    title: '研发项目',
    children: [{ key: 'web', title: '网站' }],
  },
];

export function TreeSearch() {
  const [query, setQuery] = useState('');
  return (
    <Space direction="vertical" align="stretch">
      <Input
        aria-label="搜索节点"
        placeholder="搜索节点"
        prefix={<Search />}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        allowClear
      />
      <Tree data={treeData} searchValue={query} showIcon />
    </Space>
  );
}
