import { Form, FormField, Input } from '@ifhover/leaf-ui';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
export function InputPassword() {
  const [visible, setVisible] = useState(false);
  return (
    <Form layout="vertical">
      <FormField label="Password">
        <Input
          type="password"
          aria-label="Password"
          placeholder="Enter password"
          autoComplete="new-password"
          prefix={<LockKeyhole />}
        />
      </FormField>
      <FormField label="Controlled password">
        <Input
          type="password"
          aria-label="Controlled password"
          defaultValue="leaf-garden"
          visible={visible}
          onVisibleChange={setVisible}
          visibilityIcon={(shown) => (shown ? <EyeOff size={16} /> : <Eye size={16} />)}
        />
      </FormField>
      <FormField label="Disabled password">
        <Input type="password" aria-label="Disabled password" defaultValue="leaf-garden" disabled />
      </FormField>
      <FormField label="No visibility toggle">
        <Input
          type="password"
          aria-label="No visibility toggle"
          placeholder="No visibility toggle"
          visibilityToggle={false}
        />
      </FormField>
    </Form>
  );
}
