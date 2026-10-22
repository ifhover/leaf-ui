import { Button, CommandPalette } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function CommandPaletteFailure({ english = false }: { english?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {english ? 'Async action feedback' : '异步操作反馈'}
      </Button>
      <CommandPalette
        shortcut={false}
        open={open}
        onOpenChange={setOpen}
        items={[
          {
            key: 'sync',
            label: english ? 'Sync project' : '同步项目',
            onSelect: async () => {
              throw new Error(
                english ? 'Connection unavailable. Try again.' : '连接暂不可用，请重试。',
              );
            },
          },
        ]}
      />
    </>
  );
}
