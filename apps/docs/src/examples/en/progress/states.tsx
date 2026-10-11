import { Progress, Space } from '@ifhover/leaf-ui';
export function ProgressStates() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Static progress</span>
        <Progress percent={45} active={false} />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Task failed</span>
        <Progress percent={70} status="error" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Task complete</span>
        <Progress percent={100} />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Unknown duration</span>
        <Progress indeterminate />
      </div>
    </Space>
  );
}
