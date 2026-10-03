import { Button, Card, Tag } from '@sudden3/leaf-ui';

export function CardBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Card
        title="Leaf Garden"
        extra={<Tag color="success">进行中</Tag>}
        hoverable
        footer={<Button variant="outline">查看详情</Button>}
      >
        <p>在这里整理项目、成员和近期计划。</p>
      </Card>
      <Card title="加载中" loading />
      <Card title="紧凑卡片" size="sm" bordered={false}>
        适合内容密集的页面。
      </Card>
    </div>
  );
}
