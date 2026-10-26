import { Button, Flex, QRCode, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function QRCodeRefresh() {
  const [token, setToken] = useState(1);
  const [expired, setExpired] = useState(true);

  return (
    <Flex direction="column" gap="md" align="start">
      <QRCode
        value={`https://example.com/login?token=demo-${token}`}
        status={expired ? 'expired' : 'active'}
        aria-label="登录二维码"
        onRefresh={() => {
          setToken((current) => current + 1);
          setExpired(false);
        }}
      />
      <Button onClick={() => setExpired(true)} disabled={expired}>
        设为过期
      </Button>
      <Text tone="muted" role="status">
        当前令牌：{token}，状态：{expired ? '已过期' : '可使用'}
      </Text>
    </Flex>
  );
}
