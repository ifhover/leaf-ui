import { CheckboxGroup, Tag } from '@ifhover/leaf-ui';
export function CheckboxList() {
  return (
    <CheckboxGroup
      variant="list"
      legend={'邮件权限'}
      defaultValue={['read']}
      options={[
        { value: 'read', label: '读取邮件', description: 'mail.readonly' },
        {
          value: 'send',
          label: '发送邮件',
          description: 'mail.send',
          extra: (
            <Tag color="warning" size="sm">
              {'需审批'}
            </Tag>
          ),
        },
        {
          value: 'delete',
          label: '删除邮件',
          description: 'mail.modify',
          extra: <Tag size="sm">{'已限制'}</Tag>,
          disabled: true,
        },
      ]}
    />
  );
}
