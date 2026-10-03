import { Button, Form, FormField, Input, Select } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function FormBasic() {
  const [result, setResult] = useState('');
  return (
    <Form
      className="leaf-demo-stack leaf-demo-stack--wide"
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
        <div className="leaf-demo-row">
          <Button type="submit">Submit</Button>
          <Button type="reset" variant="outline">
            Reset
          </Button>
        </div>
      </FormField>
      {result && <output className="leaf-demo-note">{result}</output>}
    </Form>
  );
}
