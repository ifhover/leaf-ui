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
        extra={<Tag color="success">进行中</Tag>}
        hoverable
        footer={
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <Avatar size="sm">LF</Avatar>
            <span style={{ color: 'var(--leaf-color-text-muted)', fontSize: 12 }}>设计团队</span>
            <Button
              variant="ghost"
              size="sm"
              endIcon={<ArrowUpRight />}
              style={{ marginInlineStart: 'auto' }}
            >
              查看项目
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
          整理项目与近期计划，让每一个好想法都有生长的空间。
        </p>
      </Card>
      <Card title="加载中" loading />
      <Card title="紧凑卡片" size="sm" bordered={false} style={{ gridColumn: '1 / -1' }}>
        适合内容密集的页面。
      </Card>
    </div>
  );
}
