import { CheckableTag } from '@ifhover/leaf-ui';

import { useState } from 'react';

export function TagCheckable() {
  const [checked, setChecked] = useState(false);
  return (
    <CheckableTag checked={checked} onChange={setChecked}>
      只看收藏
    </CheckableTag>
  );
}
