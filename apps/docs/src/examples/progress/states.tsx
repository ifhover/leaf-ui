import { Progress } from '@sudden3/leaf-ui';
export function ProgressStates() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">任务失败</span>
        <Progress percent={70} status="error" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">任务完成</span>
        <Progress percent={100} />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">进度暂时无法估计</span>
        <Progress indeterminate />
      </div>
    </div>
  );
}
