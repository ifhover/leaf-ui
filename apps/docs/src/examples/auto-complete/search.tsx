import { AutoComplete, type AutoCompleteOption } from '@leaf-ui/react';
import { useState } from 'react';

export function AutoCompleteSearch() {
  const [options, setOptions] = useState<AutoCompleteOption[]>([]);
  return (
    <div className="leaf-demo-stack">
      <AutoComplete
        aria-label="邮箱地址"
        placeholder="输入邮箱前缀"
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
      <span className="leaf-demo-note">建议由输入动态生成，也可以直接填写完整地址。</span>
    </div>
  );
}
