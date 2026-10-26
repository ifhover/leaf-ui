import { Button, Flex, Form, FormField, Input, Select, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function FormBasic() {
  const [result, setResult] = useState('');
  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setResult(`${data.get('name')} · ${data.get('email')} · ${data.get('team')}`);
      }}
      onReset={() => setResult('')}
    >
      <FormField label="Name" required>
        <Input name="name" placeholder="Your name" />
      </FormField>
      <FormField label="Work email" required help="Used for project notifications">
        <Input name="email" type="email" placeholder="hello@example.com" />
      </FormField>
      <FormField label="Team" required>
        <Select
          name="team"
          options={[
            { value: 'design', label: 'Design team' },
            { value: 'engineering', label: 'Engineering team' },
          ]}
        />
      </FormField>
      <FormField>
        <Flex gap="sm" wrap>
          <Button type="submit" variant="solid">
            Submit
          </Button>
          <Button type="reset" variant="outline">
            Reset
          </Button>
        </Flex>
      </FormField>
      {result && (
        <FormField>
          <Text role="status" tone="muted">
            Submitted: {result}
          </Text>
        </FormField>
      )}
    </Form>
  );
}
