import { Input, Space, Tree } from '@ifhover/leaf-ui';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { treeData } from './data';
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
