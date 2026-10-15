import { Button, Flex, Form, FormField, Input, Space, Switch } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function FormLabelWidth() {
  const [automatic, setAutomatic] = useState(true);
  const [extra, setExtra] = useState(false);
  return (
    <Space direction="vertical" align="stretch">
      <Flex gap="md" align="center" wrap justify="center">
        <Switch checked={automatic} onChange={(event) => setAutomatic(event.target.checked)}>
          自动标签宽度
        </Switch>
        <Button variant="outline" onClick={() => setExtra(!extra)}>
          切换长标签
        </Button>
      </Flex>
      <Form labelWidth={automatic ? 'auto' : 110}>
        <FormField label="姓名">
          <Input name="name" />
        </FormField>
        <FormField label="工作邮箱">
          <Input name="email" />
        </FormField>
        {extra && (
          <FormField label="紧急联系人电话号码">
            <Input name="emergency" />
          </FormField>
        )}
      </Form>
    </Space>
  );
}
