import { Form, FormField, Input } from '@ifhover/leaf-ui';
import { Mail, Search } from 'lucide-react';

export function InputBasic() {
  return (
    <Form layout="vertical">
      <FormField label="Project name">
        <Input aria-label="Project name" placeholder="Name your project" />
      </FormField>
      <FormField label="Search projects">
        <Input aria-label="Search projects" prefix={<Search />} placeholder="Search projects" />
      </FormField>
      <FormField label="Email">
        <Input aria-label="Email" type="email" prefix={<Mail />} placeholder="hello@leaf.design" />
      </FormField>
      <FormField label="Read-only project name">
        <Input aria-label="Read-only project name" defaultValue="Leaf Garden" readOnly />
      </FormField>
    </Form>
  );
}
