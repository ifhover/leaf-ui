import { Form, FormField, Input, InputGroup, Select } from '@ifhover/leaf-ui';
import { useId } from 'react';

export function InputGroupDemo() {
  const protocolId = useId();
  const domainId = useId();

  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="网址" htmlFor={domainId}>
        <InputGroup aria-label="网址">
          <Select
            id={protocolId}
            aria-label="协议"
            style={{ width: 110 }}
            defaultValue="https"
            options={[
              { value: 'https', label: 'https://' },
              { value: 'http', label: 'http://' },
            ]}
          />
          <Input id={domainId} aria-label="域名" placeholder="example.com" />
        </InputGroup>
      </FormField>
    </Form>
  );
}
