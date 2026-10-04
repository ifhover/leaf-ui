import { Rate } from '@sudden3/leaf-ui';
export function RateStates() {
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">只读评分</span>
        <Rate defaultValue={4} readOnly />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">禁用评分</span>
        <Rate defaultValue={2} disabled size="sm" />
      </div>
    </div>
  );
}
