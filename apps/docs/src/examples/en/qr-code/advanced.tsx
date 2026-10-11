import { QRCode, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function QRCodeStatus() {
  const [expired, setExpired] = useState(true);
  return (
    <Space wrap className="leaf-demo-row">
      <Space direction="vertical" align="stretch" className="leaf-demo-stack">
        <strong className="leaf-demo-note">Loading</strong>
        <QRCode value="Leaf UI" size={140} status="loading" />
      </Space>
      <Space direction="vertical" align="stretch" className="leaf-demo-stack">
        <strong className="leaf-demo-note">Refresh after expiry</strong>
        <QRCode
          value="Leaf UI"
          size={140}
          status={expired ? 'expired' : 'active'}
          onRefresh={() => setExpired(false)}
        />
      </Space>
      <Space direction="vertical" align="stretch" className="leaf-demo-stack">
        <strong className="leaf-demo-note">Custom color</strong>
        <QRCode value="Leaf UI" size={140} color="#2463eb" />
      </Space>
    </Space>
  );
}
