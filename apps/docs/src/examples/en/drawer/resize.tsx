import { Button, Drawer, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DrawerResize() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<number>();
  return (
    <>
      <Button onClick={() => setOpen(true)}>Resize the drawer</Button>
      <Drawer
        open={open}
        title="Resize"
        onClose={() => setOpen(false)}
        resizable
        minSize={260}
        maxSize={640}
        onResize={setSize}
      >
        <Text tone="muted" role="status">
          {size == null ? 'Not resized yet' : `Resized to: ${size}px`}
        </Text>
      </Drawer>
    </>
  );
}
