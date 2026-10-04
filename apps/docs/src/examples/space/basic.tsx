import { Button, Space } from '@sudden3/leaf-ui';

export function SpaceBasic() {
  return (
    <Space size="md" wrap>
      <Button>保存</Button>
      <Button variant="outline">取消</Button>
      <Button variant="ghost">更多</Button>
    </Space>
  );
}
