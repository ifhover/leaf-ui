import { FloatButton, FloatButtonGroup, Space, useMessage } from '@sudden3/leaf-ui';
import { Mail, Plus, Share2 } from 'lucide-react';
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
export function FloatButtonActions({ english = false }: { english?: boolean }) {
  const { message } = useMessage();
  return (
    <div style={{ position: 'relative', height: 160 }}>
      <FloatButtonGroup
        className="demo-float-group"
        actions={[
          {
            key: 'share',
            label: english ? 'Share' : '分享',
            icon: <Share2 size={18} />,
            onClick: () => message.info(english ? 'Share link copied' : '分享链接已复制'),
          },
          {
            key: 'mail',
            label: english ? 'Contact' : '联系',
            icon: <Mail size={18} />,
            onClick: () => message.info(english ? 'Contact action' : '联系操作'),
          },
        ]}
      />
      <style>
        {'.demo-float-group{position:absolute!important;inset:auto 16px 16px auto!important;}'}
      </style>
    </div>
  );
}
