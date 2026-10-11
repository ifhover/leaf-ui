import { Rate, Space } from '@ifhover/leaf-ui';
export function RateStates() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">只读评分</span>
        <Rate defaultValue={4} readOnly />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">禁用评分</span>
        <Rate defaultValue={2} disabled size="sm" />
      </div>
    </Space>
  );
}
