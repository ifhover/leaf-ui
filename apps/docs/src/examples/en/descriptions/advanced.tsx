import { Descriptions } from '@ifhover/leaf-ui';

export function DescriptionsVertical() {
  return (
    <Descriptions
      layout="vertical"
      items={[
        { key: 'name', label: 'Project', children: 'Leaf UI' },
        { key: 'owner', label: 'Owner', children: 'Alex' },
        { key: 'status', label: 'Status', children: 'Active' },
      ]}
    />
  );
}
