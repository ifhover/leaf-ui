import { Button, Popconfirm } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function PopconfirmBasic() {
  const [removed, setRemoved] = useState(false);
  return (
    <Popconfirm
      title="Remove this project?"
      description="You can restore it from the recycle bin."
      onConfirm={() => setRemoved(true)}
    >
      <Button variant="outline" danger disabled={removed}>
        {removed ? 'Removed' : 'Remove project'}
      </Button>
    </Popconfirm>
  );
}
