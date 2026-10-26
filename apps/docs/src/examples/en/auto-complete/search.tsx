import { AutoComplete, type AutoCompleteOption, Form, FormField } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function AutoCompleteSearch() {
  const [options, setOptions] = useState<AutoCompleteOption[]>([]);

  return (
    <Form layout="vertical">
      <FormField label="Email address">
        <AutoComplete
          aria-label="Email address"
          placeholder="Enter an email prefix"
          options={options}
          allowClear
          filterOption={false}
          onSearch={(query) => {
            const prefix = query.split('@')[0] ?? '';
            setOptions(
              prefix
                ? ['gmail.com', 'outlook.com', 'icloud.com'].map((domain) => ({
                    value: `${prefix}@${domain}`,
                  }))
                : [],
            );
          }}
        />
      </FormField>
    </Form>
  );
}
