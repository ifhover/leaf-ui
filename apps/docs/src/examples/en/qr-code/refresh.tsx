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
        aria-label="Sign-in QR code"
        onRefresh={() => {
          setToken((current) => current + 1);
          setExpired(false);
        }}
      />
      <Button onClick={() => setExpired(true)} disabled={expired}>
        Mark as expired
      </Button>
      <Text tone="muted" role="status">
        Token: {token}, status: {expired ? 'Expired' : 'Active'}
      </Text>
    </Flex>
  );
}
