import { Button, Flex, Form, FormErrorSummary, FormField, Input } from '@ifhover/leaf-ui';

export function FormSummary() {
  return (
    <Form onSubmit={(event) => event.preventDefault()}>
      <FormErrorSummary />
      <FormField label="姓名" required>
        <Input name="name" />
      </FormField>
      <FormField label="邮箱" required>
        <Input name="email" type="email" />
      </FormField>
      <FormField>
        <Flex gap="sm" wrap>
          <Button type="submit" variant="solid">
            检查表单
          </Button>
          <Button type="reset" variant="outline">
            重置
          </Button>
        </Flex>
      </FormField>
    </Form>
  );
}
