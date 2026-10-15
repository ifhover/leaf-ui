import { Button, Form, FormField, Input, Select, Text } from '@ifhover/leaf-ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
export function GettingStartedForm() {
  const [result, setResult] = useState('');
  return (
    <Form
      layout="vertical"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setResult(`Created: ${data.get('title')}`);
      }}
    >
      <FormField label="Project name" required>
        <Input name="title" placeholder="Leaf Garden" />
      </FormField>
      <FormField label="Team" required>
        <Select
          name="team"
          placeholder="Choose a team"
          options={[
            { label: 'Design', value: 'design' },
            { label: 'Engineering', value: 'engineering' },
          ]}
        />
      </FormField>
      <Button type="submit" startIcon={<Plus />}>
        Create project
      </Button>
      {result && (
        <Text role="status" tone="muted">
          {result}
        </Text>
      )}
    </Form>
  );
}
