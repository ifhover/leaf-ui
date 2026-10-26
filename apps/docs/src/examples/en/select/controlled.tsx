import { Button, Form, FormField, Select, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function SelectControlled() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const error = submitted && !value;
  return (
    <Form
      layout="vertical"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <FormField label="Project visibility" error={error ? 'Select visibility' : undefined}>
        <Select
          name="visibility"
          value={value}
          onChange={setValue}
          allowClear
          status={error ? 'error' : undefined}
          placeholder="Select an option"
          options={[
            { value: 'public', label: 'Public' },
            { value: 'team', label: 'Team' },
            { value: 'private', label: 'Private' },
          ]}
        />
      </FormField>
      <Button type="submit">Submit</Button>
      {submitted && value && <Text role="status">Submitted: {value}</Text>}
    </Form>
  );
}
