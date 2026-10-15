import { ConfigProvider, DatePicker, Form, FormField, Select, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfigProviderLocale() {
  const [locale, setLocale] = useState('en-US');
  return (
    <Space direction="vertical" align="stretch">
      <Select
        aria-label="Component language"
        value={locale}
        onChange={setLocale}
        options={[
          { value: 'zh-CN', label: '简体中文' },
          { value: 'zh-TW', label: '繁體中文' },
          { value: 'en-US', label: 'English' },
          { value: 'ja-JP', label: '日本語' },
          { value: 'ko-KR', label: '한국어' },
        ]}
      />
      <ConfigProvider locale={locale}>
        <Form>
          <FormField label="Date">
            <DatePicker />
          </FormField>
          <FormField label="Empty options">
            <Select options={[]} />
          </FormField>
        </Form>
      </ConfigProvider>
    </Space>
  );
}
