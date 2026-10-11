import { Button, Form, FormField, Input, Space, Switch } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function FormLabelWidth() {
  const [automatic, setAutomatic] = useState(true);
  const [extra, setExtra] = useState(false);
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack leaf-demo-stack--wide">
      <Space wrap className="leaf-demo-row">
        <Switch checked={automatic} onChange={(event) => setAutomatic(event.target.checked)}>
          Automatic label widths
        </Switch>
        <Button variant="outline" onClick={() => setExtra(!extra)}>
          Toggle long label
        </Button>
      </Space>
      <Form labelWidth={automatic ? 'auto' : 110}>
        <FormField label="Name">
          <Input name="name" />
        </FormField>
        <FormField label="Work email">
          <Input name="email" />
        </FormField>
        {extra && (
          <FormField label="Emergency contact number">
            <Input name="emergency" />
          </FormField>
        )}
      </Form>
    </Space>
  );
}
