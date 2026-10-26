import { Mentions } from '@ifhover/leaf-ui';
import { useState } from 'react';

const members = [
  { value: 'ada', label: 'Ada' },
  { value: 'lin', label: 'Lin' },
];
const topics = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
];

export function MentionsPrefixes() {
  const [prefix, setPrefix] = useState('@');
  return (
    <Mentions
      aria-label="Project note"
      prefixes={['@', '#']}
      options={prefix === '#' ? topics : members}
      onSearch={(_query, nextPrefix) => setPrefix(nextPrefix)}
      placeholder="Use @ for people and # for topics"
    />
  );
}
