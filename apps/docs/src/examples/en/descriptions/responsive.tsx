import { Descriptions } from '@ifhover/leaf-ui';

export function DescriptionsResponsive() {
  return (
    <Descriptions
      columns={{ xs: 1, md: 2 }}
      items={[
        { key: 'name', label: 'Project', children: 'Leaf UI' },
        { key: 'owner', label: 'Owner', children: 'Alex' },
        { key: 'note', label: 'Notes', children: 'A consistent interface for the team.', span: 2 },
      ]}
    />
  );
}
