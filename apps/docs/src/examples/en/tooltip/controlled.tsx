import { Button, Flex, Tooltip } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TooltipControlled() {
  const [open, setOpen] = useState(false);
  return (
    <Flex gap="sm" align="center" wrap>
      <Tooltip
        content="This setting applies to the current project"
        open={open}
        onOpenChange={setOpen}
      >
        <Button variant="outline">View help</Button>
      </Tooltip>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Show tooltip
      </Button>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Hide tooltip
      </Button>
    </Flex>
  );
}
