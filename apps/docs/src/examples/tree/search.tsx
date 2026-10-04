import { Input, Tree } from '@sudden3/leaf-ui';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { treeData } from './data';
export function TreeSearch() {
  const [query, setQuery] = useState('');
  return (
    <div className="leaf-demo-stack">
      <Input
        aria-label="搜索节点"
        placeholder="搜索节点"
        prefix={<Search />}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        allowClear
      />
      <Tree data={treeData} searchValue={query} showIcon />
    </div>
  );
}
