import { CheckboxGroup, Tag } from '@ifhover/leaf-ui';
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
