import { Avatar, Button, Card, Tag } from '@sudden3/leaf-ui';
import { ArrowUpRight, Leaf } from 'lucide-react';

export function CardBasic() {
  return (
    <div
      className="leaf-demo-stack leaf-demo-stack--wide"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 20 }}
    >
      <Card
        title="Leaf Garden"
        extra={<Tag color="success">In progress</Tag>}
        hoverable
        footer={
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <Avatar size="sm">LF</Avatar>
            <span style={{ color: 'var(--leaf-color-text-muted)', fontSize: 12 }}>Design team</span>
            <Button
              variant="ghost"
              size="sm"
              endIcon={<ArrowUpRight />}
              style={{ marginInlineStart: 'auto' }}
            >
              View project
            </Button>
          </div>
        }
      >
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            padding: 28,
            borderRadius: 'var(--leaf-radius)',
            color: 'var(--leaf-color-primary)',
            background:
              'color-mix(in srgb, var(--leaf-color-primary) 8%, var(--leaf-color-surface))',
          }}
        >
          <Leaf size={44} strokeWidth={1.3} aria-hidden="true" />
        </div>
        <p style={{ color: 'var(--leaf-color-text-muted)', marginBlockStart: 16 }}>
          Organize projects and plans, and give every good idea room to grow.
        </p>
      </Card>
      <Card title="Loading" loading />
      <Card title="Compact card" size="sm" bordered={false} style={{ gridColumn: '1 / -1' }}>
        For pages with dense content.
      </Card>
    </div>
  );
}
