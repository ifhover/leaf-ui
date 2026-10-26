import { CheckboxGroup } from '@ifhover/leaf-ui';
import { HardDrive, Mail, MessageSquare } from 'lucide-react';
export function CheckboxCards() {
  return (
    <CheckboxGroup
      variant="card"
      legend={'连接服务'}
      defaultValue={['mail']}
      options={[
        {
          value: 'mail',
          label: '邮件',
          description: '读取与整理邮件',
          icon: <Mail />,
        },
        {
          value: 'drive',
          label: '云端文件',
          description: '查找与整理文件',
          icon: <HardDrive />,
        },
        {
          value: 'chat',
          label: '团队沟通',
          description: '当前不可用',
          icon: <MessageSquare />,
          disabled: true,
        },
      ]}
    />
  );
}
