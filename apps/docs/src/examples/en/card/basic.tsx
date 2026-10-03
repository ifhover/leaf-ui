import { Button, Card, Tag } from '@sudden3/leaf-ui';

export function CardBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Card
        title="Leaf Garden"
        extra={<Tag color="success">In progress</Tag>}
        hoverable
        footer={<Button variant="outline">View details</Button>}
      >
        <p>Organize projects, members and upcoming plans here.</p>
      </Card>
      <Card title="Loading" loading />
      <Card title="Compact card" size="sm" bordered={false}>
        For pages with dense content.
      </Card>
    </div>
  );
}
