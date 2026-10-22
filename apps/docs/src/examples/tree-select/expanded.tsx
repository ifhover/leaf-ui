import { TreeSelect } from '@ifhover/leaf-ui';
import { useState } from 'react';

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

export function Expanded({ english = false }) {
  const [expanded, setExpanded] = useState<readonly string[]>(['team']);
  return (
    <TreeSelect
      aria-label={english ? 'Team members' : '团队成员'}
      onExpand={setExpanded}
      options={options(english)}
      placeholder={english ? 'Expanded branch' : '保持展开的分支'}
      treeExpandedKeys={expanded}
    />
  );
}
