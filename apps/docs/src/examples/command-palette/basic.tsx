import { Button, CommandPalette, useMessage } from '@sudden3/leaf-ui';
import { FilePlus2, Search, Settings } from 'lucide-react';
import { useState } from 'react';
export function CommandPaletteBasic({ english = false }: { english?: boolean }) {
  const [open, setOpen] = useState(false);
  const { message } = useMessage();
  return (
    <>
      <Button startIcon={<Search size={16} />} variant="outline" onClick={() => setOpen(true)}>
        {english ? 'Search commands · Ctrl/Cmd K' : '搜索命令 · Ctrl/Cmd K'}
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={[
          {
            key: 'create',
            label: english ? 'Create project' : '新建项目',
            icon: <FilePlus2 size={17} />,
            group: english ? 'Project' : '项目',
            keywords: 'new add',
            onSelect: () => {
              message.success(english ? 'Project created' : '项目已创建');
            },
          },
          {
            key: 'settings',
            label: english ? 'Settings' : '设置',
            icon: <Settings size={17} />,
            group: english ? 'Workspace' : '工作区',
            shortcut: 'G S',
            onSelect: () => {
              message.info(english ? 'Open settings' : '打开设置');
            },
          },
        ]}
      />
    </>
  );
}
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
