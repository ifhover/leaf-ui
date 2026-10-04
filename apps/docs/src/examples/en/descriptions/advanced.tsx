import { Descriptions } from '@sudden3/leaf-ui';

export function DescriptionsVertical() {
  return (
    <Descriptions
      layout="vertical"
      bordered
      columns={{ xs: 1, md: 3 }}
      items={[
        { key: 'plan', label: 'Plan', children: 'Pro' },
        { key: 'seats', label: 'Seats', children: 12 },
        { key: 'renew', label: 'Renewal', children: '2026-12-01' },
      ]}
    />
  );
}
