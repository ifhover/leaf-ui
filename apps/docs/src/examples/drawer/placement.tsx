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
      <Drawer
        open={open}
        placement={placement}
        title="文档详情"
        description="抽屉面板四周保留浮层留白，底部弹出默认支持拖动顶部手柄条下滑关闭。"
        onClose={() => setOpen(false)}
      >
        <Paragraph>
          {placement === 'bottom'
            ? '从底部弹出时默认开启 showSwipeHandle，可直接向下拖动顶部指示条关闭。'
            : '从选定的页面边缘以悬浮圆角面板展开详情；也可通过 showSwipeHandle 开启边缘滑动关闭条。'}
        </Paragraph>
      </Drawer>
    </>
  );
}
