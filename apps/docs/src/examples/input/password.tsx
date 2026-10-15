import { Form, FormField, Input } from '@ifhover/leaf-ui';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
export function InputPassword() {
  const [visible, setVisible] = useState(false);
  return (
    <Form layout="vertical">
      <FormField label="密码">
        <Input
          type="password"
          aria-label="密码"
          placeholder="请输入密码"
          autoComplete="new-password"
          prefix={<LockKeyhole />}
        />
      </FormField>
      <FormField label="受控密码">
        <Input
          type="password"
          aria-label="受控密码"
          defaultValue="leaf-garden"
          visible={visible}
          onVisibleChange={setVisible}
          visibilityIcon={(shown) => (shown ? <EyeOff size={16} /> : <Eye size={16} />)}
        />
      </FormField>
      <FormField label="禁用密码">
        <Input type="password" aria-label="禁用密码" defaultValue="leaf-garden" disabled />
      </FormField>
      <FormField label="无切换按钮">
        <Input
          type="password"
          aria-label="无切换按钮"
          placeholder="不展示切换按钮"
          visibilityToggle={false}
        />
      </FormField>
    </Form>
  );
}
