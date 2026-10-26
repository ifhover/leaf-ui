import { Form, FormField, Input } from '@ifhover/leaf-ui';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
export function InputPassword() {
  const [visible, setVisible] = useState(false);
  return (
    <Form layout="vertical">
      <FormField label="密码">
        <Input type="password" placeholder="请输入密码" autoComplete="new-password" />
      </FormField>
      <FormField label="受控密码">
        <Input
          type="password"
          defaultValue="leaf-garden"
          visible={visible}
          onVisibleChange={setVisible}
          visibilityIcon={(shown) => (shown ? <EyeOff size={16} /> : <Eye size={16} />)}
        />
      </FormField>
      <FormField label="无切换按钮">
        <Input type="password" placeholder="不展示切换按钮" visibilityToggle={false} />
      </FormField>
    </Form>
  );
}
