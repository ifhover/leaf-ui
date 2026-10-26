import { Space, TagGroup, Text } from '@ifhover/leaf-ui';

import { useState } from 'react';

export function TagSelection() {
  const [value, setValue] = useState<string[]>(['design']);
  return (
    <Space direction="vertical" align="stretch">
      <TagGroup
        options={[
          { value: 'design', label: 'Design' },
          { value: 'dev', label: 'Development' },
        ]}
        value={value}
        onChange={setValue}
      />
      <Text tone="muted" role="status">
        Selected: {value.join(', ') || 'None'}
      </Text>
    </Space>
  );
}
