import { Card, Text } from '@ifhover/leaf-ui';

export function CardTabs() {
  return (
    <Card
      tabs={{
        'aria-label': '项目概览',
        items: [
          {
            key: 'overview',
            label: '概览',
            children: <Text>让设计与开发围绕同一份计划协作。</Text>,
          },
          {
            key: 'activity',
            label: '最近动态',
            children: <Text>今天更新了组件规范。</Text>,
          },
        ],
      }}
    />
  );
}
