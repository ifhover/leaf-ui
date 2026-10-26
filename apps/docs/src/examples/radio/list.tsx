import { RadioGroup, Tag } from '@ifhover/leaf-ui';
export function RadioList() {
  return (
    <RadioGroup
      variant="list"
      label={'访问策略'}
      defaultValue="readonly"
      options={[
        {
          value: 'readonly',
          label: '只读访问',
          description: '变更需审批',
          extra: (
            <Tag color="success" size="sm">
              {'推荐'}
            </Tag>
          ),
        },
        {
          value: 'review',
          label: '每次审批',
          description: '每次操作都由负责人确认',
        },
      ]}
    />
  );
}
