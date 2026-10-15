import { Button, Card, Descriptions, Space } from '@ifhover/leaf-ui';

export function CardTabs() {
  return (
    <Card
      extra={<Button variant="link">查看项目</Button>}
      tabs={{
        'aria-label': '项目概览',
        items: [
          {
            key: 'overview',
            label: '概览',
            children: (
              <Space direction="vertical" align="stretch" size="md">
                <span>让设计与开发围绕同一份计划协作。</span>
                <Descriptions
                  columns={2}
                  items={[
                    { key: 'owner', label: '负责人', children: '林若' },
                    { key: 'members', label: '团队成员', children: '8 人' },
                  ]}
                />
              </Space>
            ),
          },
          {
            key: 'activity',
            label: '最近动态',
            children: '今天更新了组件规范，并邀请两位成员加入项目。',
          },
        ],
      }}
    />
  );
}
