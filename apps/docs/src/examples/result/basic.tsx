import { Button, Result, Space } from '@ifhover/leaf-ui';
export function ResultBasic() {
  return (
    <Result
      status="success"
      title="项目已创建"
      description="一切准备就绪，可以开始你的下一个好想法。"
      extra={
        <Space>
          <Button variant="outline">返回列表</Button>
          <Button>进入项目</Button>
        </Space>
      }
    />
  );
}
