import { Checkbox, CheckboxGroup, Space, Tag } from '@ifhover/leaf-ui';
import { HardDrive, Mail, MessageSquare } from 'lucide-react';

export function CheckboxCards({ english = false }: { english?: boolean }) {
  const t = (zh: string, en: string) => (english ? en : zh);
  return (
    <Space direction="vertical" align="stretch" style={{ width: '100%' }}>
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

export function CheckboxList({ english = false }: { english?: boolean }) {
  const t = (zh: string, en: string) => (english ? en : zh);
  return (
    <CheckboxGroup
      variant="list"
      legend={t('邮件权限', 'Mail permissions')}
      defaultValue={['read']}
      options={[
        { value: 'read', label: t('读取邮件', 'Read messages'), description: 'mail.readonly' },
        {
          value: 'send',
          label: t('发送邮件', 'Send messages'),
          description: 'mail.send',
          extra: (
            <Tag color="warning" size="sm">
              {t('需要审批', 'Needs approval')}
            </Tag>
          ),
        },
        {
          value: 'delete',
          label: t('删除邮件', 'Delete messages'),
          description: 'mail.modify',
          extra: <Tag size="sm">{t('策略限制', 'Policy restriction')}</Tag>,
          disabled: true,
        },
      ]}
    />
  );
}
