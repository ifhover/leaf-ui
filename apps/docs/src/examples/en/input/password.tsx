import { Input } from '@sudden3/leaf-ui';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
export function InputPassword() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Password</span>
        <Input
          type="password"
          aria-label="Password"
          placeholder="Enter password"
          autoComplete="new-password"
          prefix={<LockKeyhole />}
        />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Controlled password</span>
        <Input
          type="password"
          aria-label="Controlled password"
          defaultValue="leaf-garden"
          visible={visible}
          onVisibleChange={setVisible}
          visibilityIcon={(shown) => (shown ? <EyeOff size={16} /> : <Eye size={16} />)}
        />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Disabled password</span>
        <Input type="password" aria-label="Disabled password" defaultValue="leaf-garden" disabled />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">No visibility toggle</span>
        <Input
          type="password"
          aria-label="No visibility toggle"
          placeholder="No visibility toggle"
          visibilityToggle={false}
        />
      </div>
    </div>
  );
}
