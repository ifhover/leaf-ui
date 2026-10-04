import { Input, InputGroup, InputSearch, Select, Space } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function ExtensionDemo() {
  const [query, setQuery] = useState('');
  return (
    <Space direction="vertical" align="stretch">
      <label htmlFor="input-extension-1">
        搜索
        <InputSearch
          id="input-extension-1"
          placeholder="搜索项目"
          enterButton="搜索"
          onSearch={setQuery}
        />
      </label>
      <p role="status">搜索内容：{query || '未搜索'}</p>
      <div>
        <p>输入组合</p>
        <InputGroup aria-label="网址">
          <Select
            style={{ width: 110 }}
            defaultValue="https"
            options={[{ value: 'https', label: 'https://' }]}
          />
          <Input aria-label="域名" placeholder="example.com" />
        </InputGroup>
      </div>
    </Space>
  );
}
