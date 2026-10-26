import { Form, FormField, Input, Space, Switch } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function FormLabelWidth() {
  const [automatic, setAutomatic] = useState(true);
  return (
    <Space direction="vertical" align="stretch">
      <Switch checked={automatic} onChange={(event) => setAutomatic(event.target.checked)}>
        自动标签宽度
      </Switch>
      <Form labelWidth={automatic ? 'auto' : 110}>
        <FormField label="姓名">
          <Input name="name" />
        </FormField>
        <FormField label="工作邮箱">
          <Input name="email" />
        </FormField>
      </Form>
    </Space>
  );
}
