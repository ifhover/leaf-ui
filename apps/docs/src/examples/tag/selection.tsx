import { Space, TagGroup, Text } from '@ifhover/leaf-ui';

import { useState } from 'react';

export function TagSelection() {
  const [value, setValue] = useState<string[]>(['design']);
  return (
    <Space direction="vertical" align="stretch">
      <TagGroup
        options={[
          { value: 'design', label: '设计' },
          { value: 'dev', label: '开发' },
        ]}
        value={value}
        onChange={setValue}
      />
      <Text tone="muted" role="status">
        已选：{value.join(', ') || '无'}
      </Text>
    </Space>
  );
}
