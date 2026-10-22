import { Button, ConfigProvider, Form, FormField, Slider, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfigProviderSizes() {
  const [height, setHeight] = useState(34);
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <Form>
        <FormField label={`基础高度：${height}px`}>
          <Slider min={28} max={44} value={height} onChange={setHeight} showValue={false} />
        </FormField>
      </Form>
      <ConfigProvider theme={{ controlHeight: height }}>
        <Space wrap align="end" size="lg">
          {(
            [
              ['sm', '小尺寸'],
              ['md', '默认尺寸'],
              ['lg', '大尺寸'],
            ] as const
          ).map(([size, label]) => (
            <Space key={size} direction="vertical" size="sm">
              <Text tone="muted">{label}</Text>
              <Button size={size} variant="outline">
                按钮
              </Button>
            </Space>
          ))}
        </Space>
      </ConfigProvider>
    </Space>
  );
}
