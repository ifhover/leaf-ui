import { Button, Flex, Form, FormField, FormGroup, FormList, Input } from '@ifhover/leaf-ui';

export function ExtensionDemo() {
  return (
    <Form onSubmit={(event) => event.preventDefault()}>
      <FormGroup legend="Contacts">
        <FormList name="contacts" defaultValue={['']}>
          {(fields, operations) => (
            <>
              {fields.map((field) => (
                <FormField key={field.key} label={`Contact ${field.index + 1}`}>
                  <Flex direction="column" gap="sm">
                    <Input
                      name={field.name}
                      type="email"
                      placeholder="hello@example.com"
                      value={field.value}
                      onChange={(event) => operations.update(field.index, event.target.value)}
                    />
                    <Flex gap="sm" wrap>
                      <Button onClick={() => operations.remove(field.index)}>Remove</Button>
                      <Button
                        disabled={field.index === 0}
                        onClick={() => operations.move(field.index, field.index - 1)}
                      >
                        Move up
                      </Button>
                    </Flex>
                  </Flex>
                </FormField>
              ))}
              <FormField>
                <Flex gap="sm" wrap>
                  <Button onClick={() => operations.add('')}>Add contact</Button>
                  <Button type="reset" variant="outline">
                    Reset
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
