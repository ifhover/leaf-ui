import { Button, Space } from '@ifhover/leaf-ui';

export function ButtonVariants() {
  return (
    <Space wrap>
      <Button>Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="link">Link</Button>
    </Space>
  );
}
