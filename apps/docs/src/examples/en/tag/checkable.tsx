import { CheckableTag } from '@ifhover/leaf-ui';

import { useState } from 'react';

export function TagCheckable() {
  const [checked, setChecked] = useState(false);
  return (
    <CheckableTag checked={checked} onChange={setChecked}>
      Favorites only
    </CheckableTag>
  );
}
