import { Form, FormField, Input, Tree, type TreeNode } from '@ifhover/leaf-ui';
import { Search } from 'lucide-react';
import { useState } from 'react';

const treeData: TreeNode[] = [
  {
    key: 'design',
    title: 'Design resources',
    children: [
      { key: 'components', title: 'Component guidelines' },
      { key: 'colors', title: 'Brand colors' },
      { key: 'archive', title: 'Archived resources (disabled)', disabled: true },
    ],
  },
  {
    key: 'engineering',
    title: 'Engineering',
    children: [
      { key: 'web', title: 'Website' },
      { key: 'mobile', title: 'Mobile app' },
    ],
  },
];

export function TreeSearch() {
  const [query, setQuery] = useState('');
  return (
    <Form layout="vertical">
      <FormField label="Search nodes">
        <Input
          placeholder="Search nodes"
          prefix={<Search />}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          allowClear
        />
      </FormField>
      <Tree
        aria-label="Design resources"
        data={treeData}
        searchValue={query}
        defaultExpandedKeys={['design']}
      />
    </Form>
  );
}
