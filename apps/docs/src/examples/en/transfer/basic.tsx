import { Transfer } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function TransferBasic() {
  const items = Array.from({ length: 12 }, (_, index) => ({
    key: String(index),
    label: `Resource ${index + 1}`,
    disabled: index === 4,
  }));
  const [value, setValue] = useState<readonly string[]>(['1', '3']);
  return <Transfer items={items} value={value} onChange={setValue} />;
}
