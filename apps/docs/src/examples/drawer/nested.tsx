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
      <Button onClick={() => setOpen(true)}>打开第一层</Button>
      <Drawer open={open} title="第一层抽屉" onClose={closeParent}>
        <Button onClick={() => setChildOpen(true)}>打开第二层</Button>
        <Drawer
          open={childOpen}
          title="第二层抽屉"
          width={300}
          push
          onClose={() => setChildOpen(false)}
        >
          <Paragraph>这里是第二层抽屉的内容。</Paragraph>
        </Drawer>
      </Drawer>
    </>
  );
}
