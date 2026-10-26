import { Button, Drawer, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DrawerNested() {
  const [open, setOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);
  const closeParent = () => {
    setChildOpen(false);
    setOpen(false);
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open first drawer</Button>
      <Drawer open={open} title="First drawer" onClose={closeParent}>
        <Button onClick={() => setChildOpen(true)}>Open second drawer</Button>
        <Drawer
          open={childOpen}
          title="Second drawer"
          width={300}
          push
          onClose={() => setChildOpen(false)}
        >
          <Paragraph>This is the content of the second drawer.</Paragraph>
        </Drawer>
      </Drawer>
    </>
  );
}
