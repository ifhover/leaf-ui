import { Flex, Input } from '@ifhover/leaf-ui';
import { Mail, Search } from 'lucide-react';
export function InputIcons() {
  return (
    <Flex direction="column" gap="sm">
      <Input aria-label="搜索项目" placeholder="搜索项目" prefix={<Search />} />
      <Input aria-label="邮箱" placeholder="name@example.com" suffix={<Mail />} />
    </Flex>
  );
}
