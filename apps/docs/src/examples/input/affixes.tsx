import { Form, FormField, Input } from '@ifhover/leaf-ui';
import { Search } from 'lucide-react';

export function InputAffixes() {
  return (
    <Form layout="vertical">
      <FormField label="搜索项目">
        <Input prefix={<Search />} placeholder="输入关键词" />
      </FormField>
      <FormField label="域名">
        <Input suffix=".com" placeholder="example" />
      </FormField>
    </Form>
  );
}
