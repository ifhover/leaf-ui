import { Progress, Space } from '@ifhover/leaf-ui';
export function ProgressStates() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">静态进度</span>
        <Progress percent={45} active={false} />
      </div>
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
    </Space>
  );
}
