import { Form, FormField, Input } from '@ifhover/leaf-ui';
import { Search } from 'lucide-react';

export function InputAffixes() {
  return (
    <Form layout="vertical">
      <FormField label="Search projects">
        <Input prefix={<Search />} placeholder="Enter a keyword" />
      </FormField>
      <FormField label="Domain">
        <Input suffix=".com" placeholder="example" />
      </FormField>
    </Form>
  );
}
