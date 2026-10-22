import type { SelectOption } from '@ifhover/leaf-ui';
import { Select } from '@ifhover/leaf-ui';
import { useMemo } from 'react';

const buildItems = (english: boolean): SelectOption[] =>
  Array.from({ length: 5000 }, (_, index) => ({
    value: String(index),
    label: english ? `Item ${index + 1}` : `项目 ${index + 1}`,
  }));

export function VirtualList({ english = false }) {
  const options = useMemo(() => buildItems(english), [english]);
  return (
    <Select
      aria-label={english ? 'Item' : '项目'}
      options={options}
      placeholder={english ? 'Search 5000 items' : '搜索 5000 个选项'}
      showSearch
      virtual
    />
  );
}
