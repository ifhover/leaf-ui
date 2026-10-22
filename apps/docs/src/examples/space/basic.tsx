import { Button, Space } from '@ifhover/leaf-ui';

export function SpaceBasic() {
  return (
    <Space size="md" wrap>
      <Button variant="solid">保存</Button>
      <Button variant="outline">取消</Button>
      <Button variant="link">更多</Button>
    </Space>
  );
}
