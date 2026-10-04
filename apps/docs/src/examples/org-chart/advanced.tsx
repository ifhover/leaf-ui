import { Avatar, OrgChart, Space } from '@sudden3/leaf-ui';

export function OrgChartCustom() {
  return (
    <OrgChart
      zoomable={false}
      data={{
        key: 'owner',
        label: 'Alex',
        description: 'Lead',
        children: [
          { key: 'sam', label: 'Sam', description: 'Designer' },
          { key: 'lee', label: 'Lee', description: 'Engineer' },
        ],
      }}
      renderNode={(node) => (
        <Space size={10}>
          <Avatar size="sm">{String(node.label).slice(0, 1)}</Avatar>
          <span>
            <strong>{node.label}</strong>
            <small style={{ display: 'block', color: 'var(--leaf-color-text-muted)' }}>
              {node.description}
            </small>
          </span>
        </Space>
      )}
    />
  );
}
