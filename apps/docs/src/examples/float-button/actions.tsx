import { FloatButtonGroup, useMessage } from '@ifhover/leaf-ui';
import { Mail, Share2 } from 'lucide-react';
export function FloatButtonActions({ english = false }: { english?: boolean }) {
  const { message } = useMessage();
  return (
    <FloatButtonGroup
      fixed={false}
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
  );
}
