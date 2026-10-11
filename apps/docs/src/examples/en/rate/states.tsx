import { Rate, Space } from '@ifhover/leaf-ui';
export function RateStates() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Read-only rating</span>
        <Rate defaultValue={4} readOnly />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Disabled rating</span>
        <Rate defaultValue={2} disabled size="sm" />
      </div>
    </Space>
  );
}
