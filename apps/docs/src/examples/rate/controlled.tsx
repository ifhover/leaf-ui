import { Button, FormField, Rate, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function RateControlled() {
  const [value, setValue] = useState(3);

  return (
    <Space direction="vertical" align="start">
      <FormField label="项目评分" layout="vertical">
        <Rate value={value} onChange={setValue} />
      </FormField>
      <Text tone="muted" role="status">
        当前评分：{value}
      </Text>
      <Button variant="outline" onClick={() => setValue(3)}>
        重置
      </Button>
    </Space>
  );
}
