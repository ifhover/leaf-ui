import { Descriptions } from '@ifhover/leaf-ui';

export function DescriptionsBordered() {
  return (
    <Descriptions
      bordered
      items={[
        { key: 'name', label: '项目', children: 'Leaf UI' },
        { key: 'owner', label: '负责人', children: 'Alex' },
        { key: 'status', label: '状态', children: '进行中' },
      ]}
    />
  );
}
