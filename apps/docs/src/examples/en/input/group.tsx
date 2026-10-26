import { Form, FormField, Input, InputGroup, Select } from '@ifhover/leaf-ui';
import { useId } from 'react';

export function InputGroupDemo() {
  const protocolId = useId();
  const domainId = useId();

  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="URL" htmlFor={domainId}>
        <InputGroup aria-label="URL">
          <Select
            id={protocolId}
            aria-label="Protocol"
            style={{ width: 110 }}
            defaultValue="https"
            options={[
              { value: 'https', label: 'https://' },
              { value: 'http', label: 'http://' },
            ]}
          />
          <Input id={domainId} aria-label="Domain" placeholder="example.com" />
        </InputGroup>
      </FormField>
    </Form>
  );
}
