import { Button, Drawer, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DrawerBasic() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>View details</Button>
      <Drawer open={open} title="Document details" onClose={() => setOpen(false)}>
        <Paragraph>
          This document is maintained by the design team and was last updated this week.
        </Paragraph>
      </Drawer>
    </>
  );
}
