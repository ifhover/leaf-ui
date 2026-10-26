import { ConfigProvider, DatePicker, Flex, Form, FormField, Select } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfigProviderLocale() {
  const [locale, setLocale] = useState('en-US');
  return (
    <Flex direction="column" gap="lg">
      <FormField label="Component language">
        <Select
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
      </FormField>
      <ConfigProvider locale={locale}>
        <Form onSubmit={(event) => event.preventDefault()}>
          <FormField label="Date">
            <DatePicker />
          </FormField>
          <FormField label="Empty options">
            <Select options={[]} />
          </FormField>
        </Form>
      </ConfigProvider>
    </Flex>
  );
}
