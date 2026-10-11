import { Button, Space } from '@ifhover/leaf-ui';

export function ButtonVariants() {
  return (
    <Space wrap>
      <Button>主要按钮</Button>
      <Button variant="outline">描边按钮</Button>
      <Button variant="ghost">文字按钮</Button>
      <Button variant="link">链接按钮</Button>
    </Space>
  );
}
