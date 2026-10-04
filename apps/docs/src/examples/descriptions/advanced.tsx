import { Descriptions } from '@sudden3/leaf-ui';

export function DescriptionsVertical() {
  return (
    <Descriptions
      layout="vertical"
      bordered
      columns={{ xs: 1, md: 3 }}
      items={[
        { key: 'plan', label: '套餐', children: 'Pro' },
        { key: 'seats', label: '席位', children: 12 },
        { key: 'renew', label: '续费时间', children: '2026-12-01' },
      ]}
    />
  );
}
