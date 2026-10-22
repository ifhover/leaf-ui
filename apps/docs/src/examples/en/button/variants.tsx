import { Button, Space } from '@ifhover/leaf-ui';

export function ButtonVariants() {
  return (
    <Space wrap>
      <Button>Outline</Button>
      <Button variant="solid">Primary</Button>
      <Button variant="link">Link</Button>
    </Space>
  );
}
