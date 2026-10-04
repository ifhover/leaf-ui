import { Input, InputGroup, InputSearch, Select, Space } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function ExtensionDemo() {
  const [query, setQuery] = useState('');
  return (
    <Space direction="vertical" align="stretch">
      <label htmlFor="input-extension-1">
        Search
        <InputSearch
          id="input-extension-1"
          placeholder="Search projects"
          enterButton="Search"
          onSearch={setQuery}
        />
      </label>
      <p role="status">Search: {query || 'No search yet'}</p>
      <div>
        <p>Input group</p>
        <InputGroup aria-label="URL">
          <Select
            style={{ width: 110 }}
            defaultValue="https"
            options={[{ value: 'https', label: 'https://' }]}
          />
          <Input aria-label="Domain" placeholder="example.com" />
        </InputGroup>
      </div>
    </Space>
  );
}
