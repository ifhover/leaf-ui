import { Form, FormField, InputSearch, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputSearchDemo() {
  const [query, setQuery] = useState('');

  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="搜索项目">
        <InputSearch placeholder="输入关键词" enterButton="搜索" onSearch={setQuery} />
      </FormField>
      <Text tone="muted" role="status">
        搜索内容：{query || '未搜索'}
      </Text>
    </Form>
  );
}
