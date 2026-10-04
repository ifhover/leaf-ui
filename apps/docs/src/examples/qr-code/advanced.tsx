import { QRCode } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function QRCodeStatus() {
  const [expired, setExpired] = useState(true);
  return (
    <div className="leaf-demo-row">
      <div className="leaf-demo-stack">
        <strong className="leaf-demo-note">加载中</strong>
        <QRCode value="Leaf UI" size={140} status="loading" />
      </div>
      <div className="leaf-demo-stack">
        <strong className="leaf-demo-note">过期后刷新</strong>
        <QRCode
          value="Leaf UI"
          size={140}
          status={expired ? 'expired' : 'active'}
          onRefresh={() => setExpired(false)}
        />
      </div>
      <div className="leaf-demo-stack">
        <strong className="leaf-demo-note">自定义颜色</strong>
        <QRCode value="Leaf UI" size={140} color="#2463eb" />
      </div>
    </div>
  );
}
