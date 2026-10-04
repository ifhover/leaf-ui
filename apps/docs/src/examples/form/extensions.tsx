import {
  Button,
  Form,
  FormErrorSummary,
  FormField,
  FormGroup,
  FormList,
  Input,
  Space,
} from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <Form layout="vertical" onSubmit={(e) => e.preventDefault()}>
      <FormErrorSummary />
      <FormGroup legend="联系人" description="添加、移除或调整联系人顺序。">
        <FormList name="contacts" defaultValue={['']}>
          {(fields, ops) => (
            <Space direction="vertical" align="stretch">
              {fields.map((field) => (
                <Space key={field.key}>
                  <FormField label={`联系人 ${field.index + 1}`} required>
                    <Input
                      name={`${field.name}.email`}
                      type="email"
                      value={field.value}
                      onChange={(e) => ops.update(field.index, e.target.value)}
                    />
                  </FormField>
                  <Button variant="ghost" onClick={() => ops.remove(field.index)}>
                    移除
                  </Button>
                  {field.index > 0 && (
                    <Button variant="ghost" onClick={() => ops.move(field.index, field.index - 1)}>
                      上移
                    </Button>
                  )}
                </Space>
              ))}
              <Button variant="outline" onClick={() => ops.add('')}>
                添加联系人
              </Button>
            </Space>
          )}
        </FormList>
      </FormGroup>
      <Space>
        <Button type="submit">检查表单</Button>
        <Button type="reset" variant="outline">
          重置
        </Button>
      </Space>
    </Form>
  );
}
