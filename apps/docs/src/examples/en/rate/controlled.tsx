import { Button, FormField, Rate, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function RateControlled() {
  const [value, setValue] = useState(3);

  return (
    <Space direction="vertical" align="start">
      <FormField label="Project rating" layout="vertical">
        <Rate value={value} onChange={setValue} />
      </FormField>
      <Text tone="muted" role="status">
        Current rating: {value}
      </Text>
      <Button variant="outline" onClick={() => setValue(3)}>
        Reset
      </Button>
    </Space>
  );
}
