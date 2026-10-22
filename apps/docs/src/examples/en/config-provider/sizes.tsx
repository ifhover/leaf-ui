import { Button, ConfigProvider, Form, FormField, Slider, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfigProviderSizes() {
  const [height, setHeight] = useState(34);
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <Form>
        <FormField label={`Base height: ${height}px`}>
          <Slider min={28} max={44} value={height} onChange={setHeight} showValue={false} />
        </FormField>
      </Form>
      <ConfigProvider theme={{ controlHeight: height }}>
        <Space wrap align="end" size="lg">
          {(
            [
              ['sm', 'Small'],
              ['md', 'Default'],
              ['lg', 'Large'],
            ] as const
          ).map(([size, label]) => (
            <Space key={size} direction="vertical" size="sm">
              <Text tone="muted">{label}</Text>
              <Button size={size} variant="outline">
                Button
              </Button>
            </Space>
          ))}
        </Space>
      </ConfigProvider>
    </Space>
  );
}
