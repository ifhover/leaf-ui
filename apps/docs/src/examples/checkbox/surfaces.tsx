import { Checkbox, CheckboxGroup, Space } from '@ifhover/leaf-ui';
import { HardDrive, Mail, MessageSquare } from 'lucide-react';
export function CheckboxCards({ english = false }: { english?: boolean }) {
  const t = (zh: string, en: string) => (english ? en : zh);
  return (
    <Space direction="vertical" align="stretch">
      <CheckboxGroup
        variant="card"
        legend={t('连接服务', 'Connected services')}
        defaultValue={['mail']}
        options={[
          {
            value: 'mail',
            label: t('邮件', 'Mail'),
            description: t('读取与整理邮件', 'Read and organize messages'),
            icon: <Mail />,
          },
          {
            value: 'drive',
            label: t('云端文件', 'Cloud drive'),
            description: t('查找与整理文件', 'Find and organize files'),
            icon: <HardDrive />,
          },
          {
            value: 'chat',
            label: t('团队沟通', 'Team chat'),
            description: t('当前不可用', 'Currently unavailable'),
            icon: <MessageSquare />,
            disabled: true,
          },
        ]}
      />
      <Checkbox
        variant="card"
        indeterminate
        description={t('部分服务已启用', 'Some services are enabled')}
      >
        {t('全部服务', 'All services')}
      </Checkbox>
    </Space>
  );
}
