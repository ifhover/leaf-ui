import { Flex, FormField, Input } from '@ifhover/leaf-ui';
import { Mail, Search } from 'lucide-react';

export function IconFields() {
  return (
    <Flex direction="column" gap="lg">
      <FormField label="Search">
        <Input placeholder="Search projects" prefix={<Search />} />
      </FormField>
      <FormField label="Email">
        <Input type="email" placeholder="name@example.com" suffix={<Mail />} />
      </FormField>
    </Flex>
  );
}
