import { FloatButton, Space, useMessage } from '@ifhover/leaf-ui';
import { Mail, Plus } from 'lucide-react';
export function FloatButtonBasic({ english = false }: { english?: boolean }) {
  const { message } = useMessage();
  return (
    <Space size={16}>
      <FloatButton
        fixed={false}
        startIcon={<Plus size={20} />}
        tooltip={english ? 'Create' : '新建'}
        aria-label={english ? 'Create' : '新建'}
        onClick={() => message.success(english ? 'Created' : '已创建')}
      />
      <FloatButton
        fixed={false}
        variant="outline"
        startIcon={<Mail size={20} />}
        tooltip={english ? 'Inbox' : '收件箱'}
        aria-label={english ? 'Inbox' : '收件箱'}
      />
    </Space>
  );
}
