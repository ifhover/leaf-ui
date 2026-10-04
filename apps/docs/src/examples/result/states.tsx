import { Button, Result } from '@sudden3/leaf-ui';
export function ResultStates() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Result
        status="empty"
        size="sm"
        title="还没有项目"
        description="创建你的第一个项目，开始整理灵感。"
        extra={<Button variant="outline">创建项目</Button>}
      />
      <Result
        status="warning"
        size="sm"
        title="存储空间即将用完"
        description="清理不需要的内容，或调整空间配额。"
      />
      <Result
        status="error"
        size="sm"
        title="发布未完成"
        description="请检查连接后重试。"
        extra={<Button variant="outline">重试</Button>}
      />
      <Result status="info" size="sm" title="审核正在进行" description="完成后将在项目页面更新。" />
    </div>
  );
}
