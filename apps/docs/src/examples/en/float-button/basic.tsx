import { FloatButton, Space, Text } from '@ifhover/leaf-ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export function FloatButtonBasic() {
  const [count, setCount] = useState(0);
  return (
    <Space direction="vertical" align="stretch">
      <div style={{ height: 200, position: 'relative', transform: 'translateZ(0)' }}>
        <FloatButton
          aria-label="Create"
          tooltip="Create"
          startIcon={<Plus />}
          onClick={() => setCount((value) => value + 1)}
        />
      </div>
      <Text tone="muted" role="status">
        Created: {count}
      </Text>
    </Space>
  );
}
