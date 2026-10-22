import { Button, Flex, Tooltip } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function TooltipControlled() {
  const [open, setOpen] = useState(false);
  return (
    <Flex gap="md" align="center" wrap>
      <Tooltip content="Controlled tooltip" open={open} onOpenChange={setOpen}>
        <Button variant="outline">Hover or toggle</Button>
      </Tooltip>
      <Button onClick={() => setOpen((value) => !value)}>
        {open ? 'Hide tooltip' : 'Show tooltip'}
      </Button>
    </Flex>
  );
}
