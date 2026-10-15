import { AutoComplete, type AutoCompleteOption, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function AutoCompleteSearch() {
  const [options, setOptions] = useState<AutoCompleteOption[]>([]);
  return (
    <Form layout="vertical">
      <FormField label="Email address">
        <AutoComplete
          aria-label="Email address"
          placeholder="Enter the first part of an email"
          options={options}
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
      <Text tone="muted">
        Suggestions are generated as you type. You can also enter a complete address.
      </Text>
    </Form>
  );
}
