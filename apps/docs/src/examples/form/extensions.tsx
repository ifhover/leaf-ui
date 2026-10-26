import { Button, Flex, Form, FormField, FormGroup, FormList, Input } from '@ifhover/leaf-ui';

export function ExtensionDemo() {
  return (
    <Form onSubmit={(event) => event.preventDefault()}>
      <FormGroup legend="联系人">
        <FormList name="contacts" defaultValue={['']}>
          {(fields, operations) => (
            <>
              {fields.map((field) => (
                <FormField key={field.key} label={`联系人 ${field.index + 1}`}>
                  <Flex direction="column" gap="sm">
                    <Input
                      name={field.name}
                      type="email"
                      placeholder="hello@example.com"
                      value={field.value}
                      onChange={(event) => operations.update(field.index, event.target.value)}
                    />
                    <Flex gap="sm" wrap>
                      <Button onClick={() => operations.remove(field.index)}>移除</Button>
                      <Button
                        disabled={field.index === 0}
                        onClick={() => operations.move(field.index, field.index - 1)}
                      >
                        上移
                      </Button>
                    </Flex>
                  </Flex>
                </FormField>
              ))}
              <FormField>
                <Flex gap="sm" wrap>
                  <Button onClick={() => operations.add('')}>添加联系人</Button>
                  <Button type="reset" variant="outline">
                    重置
                  </Button>
                </Flex>
              </FormField>
            </>
          )}
        </FormList>
      </FormGroup>
    </Form>
  );
}
