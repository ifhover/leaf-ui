import { Form, FormField, InputSearch, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputSearchDemo() {
  const [query, setQuery] = useState('');

  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Search projects">
        <InputSearch placeholder="Enter a keyword" enterButton="Search" onSearch={setQuery} />
      </FormField>
      <Text tone="muted" role="status">
        Search: {query || 'No search yet'}
      </Text>
    </Form>
  );
}
