import { Descriptions, Tag } from '@sudden3/leaf-ui';

export function DescriptionsBasic() {
  return (
    <Descriptions
      title="项目信息"
      columns={{ xs: 1, md: 2 }}
      items={[
        { key: 'name', label: '项目', children: 'Leaf UI' },
        { key: 'owner', label: '负责人', children: 'Alex' },
        { key: 'status', label: '状态', children: <Tag color="success">进行中</Tag> },
        { key: 'note', label: '说明', children: '统一团队的产品界面。', span: 2 },
      ]}
    />
  );
}
