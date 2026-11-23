import { Button, Drawer, type DrawerProps, Paragraph, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';

const placements = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
] as const;

export function DrawerPlacement() {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<DrawerProps['placement']>('right');
  return (
    <>
      <Space wrap>
        {placements.map((item) => (
          <Button
            key={item.value}
            onClick={() => {
              setPlacement(item.value);
              setOpen(true);
            }}
          >
            {item.label}
          </Button>
        ))}
      </Space>
      <Drawer
        open={open}
        placement={placement}
        title="Document details"
        description="Drawers float with edge insets; bottom placement defaults to a swipe-to-close handle."
        onClose={() => setOpen(false)}
      >
        <Paragraph>
          {placement === 'bottom'
            ? 'Bottom placement enables showSwipeHandle by default so dragging the top handle downward closes the drawer.'
            : 'Open details from the selected edge as a floating rounded panel; set showSwipeHandle to enable swipe-to-close on any side.'}
        </Paragraph>
      </Drawer>
    </>
  );
}
