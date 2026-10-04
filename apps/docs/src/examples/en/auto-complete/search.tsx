import { AutoComplete, type AutoCompleteOption } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function AutoCompleteSearch() {
  const [options, setOptions] = useState<AutoCompleteOption[]>([]);
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Email address</span>
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
      </div>
      <span className="leaf-demo-note">
        Suggestions are generated as you type. You can also enter a complete address.
      </span>
    </div>
  );
}
