import { Input } from '@sudden3/leaf-ui';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
export function InputPassword() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="leaf-demo-stack">
      <Input
        type="password"
        aria-label="密码"
        placeholder="请输入密码"
        autoComplete="new-password"
        prefix={<LockKeyhole />}
      />
      <Input
        type="password"
        aria-label="受控密码"
        defaultValue="leaf-garden"
        visible={visible}
        onVisibleChange={setVisible}
        visibilityIcon={(shown) => (shown ? <EyeOff size={16} /> : <Eye size={16} />)}
      />
      <Input type="password" aria-label="禁用密码" defaultValue="leaf-garden" disabled />
      <Input
        type="password"
        aria-label="无切换按钮"
        placeholder="不展示切换按钮"
        visibilityToggle={false}
      />
    </div>
  );
}
