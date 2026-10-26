import { Form, FormField, Input, Tree, type TreeNode } from '@ifhover/leaf-ui';
import { Search } from 'lucide-react';
import { useState } from 'react';

const treeData: TreeNode[] = [
  {
    key: 'design',
    title: '设计资源',
    children: [
      { key: 'components', title: '组件规范' },
      { key: 'colors', title: '品牌颜色' },
      { key: 'archive', title: '归档资源（不可选）', disabled: true },
    ],
  },
  {
    key: 'engineering',
    title: '研发项目',
    children: [
      { key: 'web', title: '网站' },
      { key: 'mobile', title: '移动应用' },
    ],
  },
];

export function TreeSearch() {
  const [query, setQuery] = useState('');
  return (
    <Form layout="vertical">
      <FormField label="搜索节点">
        <Input
          placeholder="搜索节点"
          prefix={<Search />}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          allowClear
        />
      </FormField>
      <Tree
        aria-label="设计资源"
        data={treeData}
        searchValue={query}
        defaultExpandedKeys={['design']}
      />
    </Form>
  );
}
