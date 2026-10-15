import { Flex, QRCode, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function QRCodeStatus() {
  const [expired, setExpired] = useState(true);
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Space direction="vertical" align="stretch">
        <Text tone="muted">Loading</Text>
        <QRCode value="Leaf UI" size={140} status="loading" />
      </Space>
      <Space direction="vertical" align="stretch">
        <Text tone="muted">Refresh after expiry</Text>
        <QRCode
          value="Leaf UI"
          size={140}
          status={expired ? 'expired' : 'active'}
          onRefresh={() => setExpired(false)}
        />
      </Space>
      <Space direction="vertical" align="stretch">
        <Text tone="muted">Custom color</Text>
        <QRCode value="Leaf UI" size={140} color="#2463eb" />
      </Space>
    </Flex>
  );
}
