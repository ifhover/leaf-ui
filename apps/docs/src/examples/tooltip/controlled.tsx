import { Button, Flex, Tooltip } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function TooltipControlled() {
  const [open, setOpen] = useState(false);
  return (
    <Flex gap="md" align="center" wrap>
      <Tooltip content="受控展开的说明" open={open} onOpenChange={setOpen}>
        <Button variant="outline">悬停或点击切换</Button>
      </Tooltip>
      <Button  onClick={() => setOpen((value) => !value)}>
        {open ? '收起提示' : '展开提示'}
      </Button>
    </Flex>
  );
}
