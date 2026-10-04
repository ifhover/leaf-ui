import { Descriptions, Tag } from '@sudden3/leaf-ui';

export function DescriptionsBasic() {
  return (
    <Descriptions
      title="Project details"
      columns={{ xs: 1, md: 2 }}
      items={[
        { key: 'name', label: 'Project', children: 'Leaf UI' },
        { key: 'owner', label: 'Owner', children: 'Alex' },
        { key: 'status', label: 'Status', children: <Tag color="success">Active</Tag> },
        { key: 'note', label: 'Notes', children: 'A consistent interface for the team.', span: 2 },
      ]}
    />
  );
}
