import { Button, Drawer, Input, Space } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function Capabilities({ english = false }) {
  const [open, setOpen] = useState(false),
    [child, setChild] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {english ? 'Resizable workspace' : '可调整宽度的工作区'}
      </Button>
      <Drawer
        title={english ? 'Workspace' : '工作区'}
        open={open}
        onClose={() => setOpen(false)}
        resizable
        minSize={260}
        maxSize={640}
      >
        <Space direction="vertical">
          <Input aria-label="Project" />
          <Button onClick={() => setChild(true)}>{english ? 'Open details' : '查看详情'}</Button>
        </Space>
        <Drawer
          open={child}
          onClose={() => setChild(false)}
          title={english ? 'Details' : '详情'}
          width={300}
          push={120}
        >
          Details
        </Drawer>
      </Drawer>
    </>
  );
}
