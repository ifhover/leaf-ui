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
      <FormGroup legend="Contacts" description="Add, remove or reorder contacts.">
        <FormList name="contacts" defaultValue={['']}>
          {(fields, ops) => (
            <>
              {fields.map((field) => (
                <FormField key={field.key} label={`Contact ${field.index + 1}`} required>
                  <Flex gap="sm" align="start">
                    <Input
                      style={{ flex: 1, minWidth: 0 }}
                      name={`${field.name}.email`}
                      type="email"
                      value={field.value}
                      onChange={(e) => ops.update(field.index, e.target.value)}
                    />
                    <Button  onClick={() => ops.remove(field.index)}>
                      Remove
                    </Button>
                    {field.index > 0 && (
                      <Button  onClick={() => ops.move(field.index, field.index - 1)}>
                        Move up
                      </Button>
                    )}
                  </Flex>
                </FormField>
              ))}
              <Button variant="outline" onClick={() => ops.add('')}>
                Add contact
              </Button>
            </>
          )}
        </FormList>
      </FormGroup>
      <Space>
        <Button type="submit">Validate</Button>
        <Button type="reset" variant="outline">
          Reset
        </Button>
      </Space>
    </Form>
  );
}
