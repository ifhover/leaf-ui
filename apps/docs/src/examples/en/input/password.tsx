import { Form, FormField, Input } from '@ifhover/leaf-ui';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
export function InputPassword() {
  const [visible, setVisible] = useState(false);
  return (
    <Form layout="vertical">
      <FormField label="Password">
        <Input type="password" placeholder="Enter password" autoComplete="new-password" />
      </FormField>
      <FormField label="Controlled password">
        <Input
          type="password"
          defaultValue="leaf-garden"
          visible={visible}
          onVisibleChange={setVisible}
          visibilityIcon={(shown) => (shown ? <EyeOff size={16} /> : <Eye size={16} />)}
        />
      </FormField>
      <FormField label="No visibility toggle">
        <Input type="password" placeholder="No visibility toggle" visibilityToggle={false} />
      </FormField>
    </Form>
  );
}
