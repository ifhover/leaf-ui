import { Button, Drawer, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DrawerTabs() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('overview');
  return (
    <>
      <Button onClick={() => setOpen(true)}>查看详情</Button>
      <Drawer
        open={open}
        title="任务详情"
        onClose={() => setOpen(false)}
        tabs={{
          activeKey: view,
          onChange: setView,
          items: [
            { key: 'overview', label: '概览' },
            { key: 'logs', label: '运行日志' },
          ],
        }}
      >
        <Text>
          {view === 'overview'
            ? '省略标签项 children 时，可将标签栏作为正文状态切换器使用。'
            : '正在展示运行日志视图，标签栏底部分割线始终保留。'}
        </Text>
      </Drawer>
    </>
  );
}
