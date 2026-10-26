import { Button, Drawer, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DrawerBasic() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>查看详情</Button>
      <Drawer open={open} title="文档详情" onClose={() => setOpen(false)}>
        <Paragraph>此文档由设计团队维护，最近更新于本周。</Paragraph>
      </Drawer>
    </>
  );
}
