import { Button, Flex, Form, FormField, Input, Text, useFormValidation } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function FormValidation() {
  const [saved, setSaved] = useState('');
  const validation = useFormValidation({
    validate: (data) => {
      const errors: Record<string, string> = {};
      if (!String(data.get('name') ?? '').trim()) errors.name = 'Enter a name';
      return errors;
    },
    onSubmit: (data) => setSaved(String(data.get('name')).trim()),
  });
  return (
    <Form
      noValidate
      onSubmit={validation.handleSubmit}
      onReset={(event) => {
        validation.handleReset(event);
        setSaved('');
      }}
    >
      <FormField label="Name" required error={validation.errors.name}>
        <Input
          name="name"
          onChange={() => {
            validation.clearErrors('name');
            setSaved('');
          }}
        />
      </FormField>
      <FormField>
        <Flex gap="sm" wrap>
          <Button type="submit" loading={validation.pending}>
            Save
          </Button>
          <Button type="reset" variant="outline">
            Reset
          </Button>
        </Flex>
      </FormField>
      {saved && (
        <FormField>
          <Text role="status" tone="muted">
            Saved: {saved}
          </Text>
        </FormField>
      )}
    </Form>
  );
}
