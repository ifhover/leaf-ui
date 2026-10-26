import { Descriptions } from '@ifhover/leaf-ui';

export function DescriptionsBasic() {
  return (
    <Descriptions
      items={[
        { key: 'name', label: 'Project', children: 'Leaf UI' },
        { key: 'owner', label: 'Owner', children: 'Alex' },
        { key: 'status', label: 'Status', children: 'Active' },
      ]}
    />
  );
}
