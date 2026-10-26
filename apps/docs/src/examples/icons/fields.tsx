import { Flex, FormField, Input } from '@ifhover/leaf-ui';
import { Mail, Search } from 'lucide-react';

export function IconFields() {
  return (
    <Flex direction="column" gap="lg">
      <FormField label="搜索">
        <Input placeholder="搜索项目" prefix={<Search />} />
      </FormField>
      <FormField label="邮箱">
        <Input type="email" placeholder="name@example.com" suffix={<Mail />} />
      </FormField>
    </Flex>
  );
}
