import { Progress } from '@sudden3/leaf-ui';
export function ProgressCircles() {
  return (
    <div className="leaf-demo-row">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">In progress</span>
        <Progress percent={45} type="circle" size={80} />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Complete</span>
        <Progress percent={100} type="circle" size={80} />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Failed</span>
        <Progress percent={60} type="circle" status="error" size={80} />
      </div>
    </div>
  );
}
