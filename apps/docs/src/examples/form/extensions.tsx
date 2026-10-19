import {
  Button,
  Flex,
  Form,
  FormErrorSummary,
  FormField,
  FormGroup,
  FormList,
  Input,
  Space,
} from '@ifhover/leaf-ui';
export function ExtensionDemo() {
  return (
    <Form layout="vertical" onSubmit={(e) => e.preventDefault()}>
      <FormErrorSummary />
      <FormGroup legend="联系人" description="添加、移除或调整联系人顺序。">
        <FormList name="contacts" defaultValue={['']}>
          {(fields, ops) => (
            <>
              {fields.map((field) => (
                <FormField key={field.key} label={`联系人 ${field.index + 1}`} required>
                  <Flex gap="sm" align="start">
                    <Input
                      style={{ flex: 1, minWidth: 0 }}
                      name={`${field.name}.email`}
                      type="email"
                      value={field.value}
                      onChange={(e) => ops.update(field.index, e.target.value)}
                    />
                    <Button variant="soft" onClick={() => ops.remove(field.index)}>
                      移除
                    </Button>
                    {field.index > 0 && (
                      <Button variant="soft" onClick={() => ops.move(field.index, field.index - 1)}>
                        上移
                      </Button>
                    )}
                  </Flex>
                </FormField>
              ))}
              <Button variant="outline" onClick={() => ops.add('')}>
                添加联系人
              </Button>
            </>
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
