import { Button, Form, FormField, Input, Switch } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function FormLabelWidth() {
  const [automatic, setAutomatic] = useState(true);
  const [extra, setExtra] = useState(false);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-row">
        <Switch checked={automatic} onChange={(event) => setAutomatic(event.target.checked)}>
          Automatic label widths
        </Switch>
        <Button variant="outline" onClick={() => setExtra(!extra)}>
          Toggle long label
        </Button>
      </div>
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
    </div>
  );
}
