import { Form, FormField, Input } from '@ifhover/leaf-ui';
import { Mail, Search } from 'lucide-react';

export function InputBasic() {
  return (
    <Form layout="vertical">
      <FormField label="项目名称">
        <Input aria-label="项目名称" placeholder="为你的项目起个名字" />
      </FormField>
      <FormField label="搜索项目">
        <Input aria-label="搜索项目" prefix={<Search />} placeholder="搜索项目" />
      </FormField>
      <FormField label="邮箱">
        <Input aria-label="邮箱" type="email" prefix={<Mail />} placeholder="hello@leaf.design" />
      </FormField>
      <FormField label="只读项目名称">
        <Input aria-label="只读项目名称" defaultValue="Leaf Garden" readOnly />
      </FormField>
    </Form>
  );
}
