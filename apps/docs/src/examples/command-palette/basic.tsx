import { Button, CommandPalette, useMessage } from '@ifhover/leaf-ui';
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
