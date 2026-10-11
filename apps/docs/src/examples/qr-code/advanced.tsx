import { QRCode, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function QRCodeStatus() {
  const [expired, setExpired] = useState(true);
  return (
    <Space wrap className="leaf-demo-row">
      <Space direction="vertical" align="stretch" className="leaf-demo-stack">
        <strong className="leaf-demo-note">加载中</strong>
        <QRCode value="Leaf UI" size={140} status="loading" />
      </Space>
      <Space direction="vertical" align="stretch" className="leaf-demo-stack">
        <strong className="leaf-demo-note">过期后刷新</strong>
        <QRCode
          value="Leaf UI"
          size={140}
          status={expired ? 'expired' : 'active'}
          onRefresh={() => setExpired(false)}
        />
      </Space>
      <Space direction="vertical" align="stretch" className="leaf-demo-stack">
        <strong className="leaf-demo-note">自定义颜色</strong>
        <QRCode value="Leaf UI" size={140} color="#2463eb" />
      </Space>
    </Space>
  );
}
