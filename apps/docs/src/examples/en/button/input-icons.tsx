import { Flex, Input } from '@ifhover/leaf-ui';
import { Mail, Search } from 'lucide-react';
export function InputIcons() {
  return (
    <Flex direction="column" gap="sm">
      <Input aria-label="Search projects" placeholder="Search projects" prefix={<Search />} />
      <Input aria-label="Email" placeholder="name@example.com" suffix={<Mail />} />
    </Flex>
  );
}
