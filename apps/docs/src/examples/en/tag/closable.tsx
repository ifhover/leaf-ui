import { Space, Tag, Text } from '@ifhover/leaf-ui';

import { useState } from 'react';

export function TagClosable() {
  const [tags, setTags] = useState(['Leaf', 'React']);
  return (
    <Space wrap>
      {tags.map((tag) => (
        <Tag
          key={tag}
          closable
          onClose={() => setTags((items) => items.filter((item) => item !== tag))}
        >
          {tag}
        </Tag>
      ))}
      {tags.length === 0 && (
        <Text tone="muted" role="status">
          All tags closed
        </Text>
      )}
    </Space>
  );
}
