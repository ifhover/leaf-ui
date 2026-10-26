import { Mentions } from '@ifhover/leaf-ui';
import { useState } from 'react';

const members = [
  { value: 'ada', label: 'Ada' },
  { value: 'lin', label: 'Lin' },
];
const topics = [
  { value: 'design', label: '设计' },
  { value: 'engineering', label: '工程' },
];

export function MentionsPrefixes() {
  const [prefix, setPrefix] = useState('@');
  return (
    <Mentions
      aria-label="项目备注"
      prefixes={['@', '#']}
      options={prefix === '#' ? topics : members}
      onSearch={(_query, nextPrefix) => setPrefix(nextPrefix)}
      placeholder="使用 @ 提及成员，# 引用主题"
    />
  );
}
