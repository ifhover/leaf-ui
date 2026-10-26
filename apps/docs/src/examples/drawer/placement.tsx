import { Button, Drawer, type DrawerProps, Paragraph, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';

const placements = [
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
  { value: 'top', label: '顶部' },
  { value: 'bottom', label: '底部' },
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
      <Drawer open={open} placement={placement} title="文档详情" onClose={() => setOpen(false)}>
        <Paragraph>从选定的页面边缘展开详情。</Paragraph>
      </Drawer>
    </>
  );
}
