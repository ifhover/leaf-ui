import { Button, Drawer, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DrawerResize() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<number>();
  return (
    <>
      <Button onClick={() => setOpen(true)}>调整抽屉宽度</Button>
      <Drawer
        open={open}
        title="调整宽度"
        onClose={() => setOpen(false)}
        resizable
        minSize={260}
        maxSize={640}
        onResize={setSize}
      >
        <Text tone="muted" role="status">
          {size == null ? '尚未调整尺寸' : `调整值：${size}px`}
        </Text>
      </Drawer>
    </>
  );
}
