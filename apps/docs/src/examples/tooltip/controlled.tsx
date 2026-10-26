import { Button, Flex, Tooltip } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TooltipControlled() {
  const [open, setOpen] = useState(false);
  return (
    <Flex gap="sm" align="center" wrap>
      <Tooltip content="该设置应用于当前项目" open={open} onOpenChange={setOpen}>
        <Button variant="outline">查看说明</Button>
      </Tooltip>
      <Button variant="outline" onClick={() => setOpen(true)}>
        展开提示
      </Button>
      <Button variant="outline" onClick={() => setOpen(false)}>
        收起提示
      </Button>
    </Flex>
  );
}
