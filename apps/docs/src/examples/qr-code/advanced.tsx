import { Flex, QRCode, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function QRCodeStatus() {
  const [expired, setExpired] = useState(true);
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Space direction="vertical" align="stretch">
        <Text tone="muted">加载中</Text>
        <QRCode value="Leaf UI" size={140} status="loading" />
      </Space>
      <Space direction="vertical" align="stretch">
        <Text tone="muted">过期后刷新</Text>
        <QRCode
          value="Leaf UI"
          size={140}
          status={expired ? 'expired' : 'active'}
          onRefresh={() => setExpired(false)}
        />
      </Space>
      <Space direction="vertical" align="stretch">
        <Text tone="muted">自定义颜色</Text>
        <QRCode value="Leaf UI" size={140} color="#2463eb" />
      </Space>
    </Flex>
  );
}
