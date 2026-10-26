import { Form, FormField, Input, Space, Switch } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function FormLabelWidth() {
  const [automatic, setAutomatic] = useState(true);
  return (
    <Space direction="vertical" align="stretch">
      <Switch checked={automatic} onChange={(event) => setAutomatic(event.target.checked)}>
        Automatic label widths
      </Switch>
      <Form labelWidth={automatic ? 'auto' : 110}>
        <FormField label="Name">
          <Input name="name" />
        </FormField>
        <FormField label="Work email">
          <Input name="email" />
        </FormField>
      </Form>
    </Space>
  );
}
