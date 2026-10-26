import { Descriptions } from '@ifhover/leaf-ui';

export function DescriptionsResponsive() {
  return (
    <Descriptions
      columns={{ xs: 1, md: 2 }}
      items={[
        { key: 'name', label: '项目', children: 'Leaf UI' },
        { key: 'owner', label: '负责人', children: 'Alex' },
        { key: 'note', label: '说明', children: '统一团队的产品界面。', span: 2 },
      ]}
    />
  );
}
