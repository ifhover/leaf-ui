import { RadioGroup, Tag } from '@ifhover/leaf-ui';
export function RadioList() {
  return (
    <RadioGroup
      variant="list"
      label={'Access policy'}
      defaultValue="readonly"
      options={[
        {
          value: 'readonly',
          label: 'Read only',
          description: 'Changes require approval',
          extra: (
            <Tag color="success" size="sm">
              {'Recommended'}
            </Tag>
          ),
        },
        {
          value: 'review',
          label: 'Approve every request',
          description: 'Ask the owner to approve every action',
        },
      ]}
    />
  );
}
