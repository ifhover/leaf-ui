import { CheckboxGroup, Tag } from '@ifhover/leaf-ui';
export function CheckboxList() {
  return (
    <CheckboxGroup
      variant="list"
      legend={'Mail permissions'}
      defaultValue={['read']}
      options={[
        { value: 'read', label: 'Read messages', description: 'mail.readonly' },
        {
          value: 'send',
          label: 'Send messages',
          description: 'mail.send',
          extra: (
            <Tag color="warning" size="sm">
              {'Approval'}
            </Tag>
          ),
        },
        {
          value: 'delete',
          label: 'Delete messages',
          description: 'mail.modify',
          extra: <Tag size="sm">{'Restricted'}</Tag>,
          disabled: true,
        },
      ]}
    />
  );
}
