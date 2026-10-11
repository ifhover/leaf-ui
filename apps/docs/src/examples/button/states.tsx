import { Button, Space } from '@ifhover/leaf-ui';

export function ButtonStates() {
  return (
    <Space wrap>
      <Button disabled>暂不可用</Button>
      <Button loading>加载中</Button>
      <Button variant="outline" disabled>
        已禁用
      </Button>
    </Space>
  );
}
