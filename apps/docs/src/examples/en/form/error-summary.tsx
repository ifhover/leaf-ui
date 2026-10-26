import { Button, Flex, Form, FormErrorSummary, FormField, Input } from '@ifhover/leaf-ui';

export function FormSummary() {
  return (
    <Form onSubmit={(event) => event.preventDefault()}>
      <FormErrorSummary />
      <FormField label="Name" required>
        <Input name="name" />
      </FormField>
      <FormField label="Email" required>
        <Input name="email" type="email" />
      </FormField>
      <FormField>
        <Flex gap="sm" wrap>
          <Button type="submit" variant="solid">
            Validate
          </Button>
          <Button type="reset" variant="outline">
            Reset
          </Button>
        </Flex>
      </FormField>
    </Form>
  );
}
