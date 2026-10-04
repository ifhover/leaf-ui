import { QRCode } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function QRCodeStatus() {
  const [expired, setExpired] = useState(true);
  return (
    <div className="leaf-demo-row">
      <div className="leaf-demo-stack">
        <strong className="leaf-demo-note">Loading</strong>
        <QRCode value="Leaf UI" size={140} status="loading" />
      </div>
      <div className="leaf-demo-stack">
        <strong className="leaf-demo-note">Refresh after expiry</strong>
        <QRCode
          value="Leaf UI"
          size={140}
          status={expired ? 'expired' : 'active'}
          onRefresh={() => setExpired(false)}
        />
      </div>
      <div className="leaf-demo-stack">
        <strong className="leaf-demo-note">Custom color</strong>
        <QRCode value="Leaf UI" size={140} color="#2463eb" />
      </div>
    </div>
  );
}
