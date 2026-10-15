import { Flex } from '@ifhover/leaf-ui';

export function TailwindBasic() {
  return (
    <Flex
      direction="column"
      gap="sm"
      className="rounded-leaf border border-leaf-border bg-leaf-surface p-leaf-md font-leaf text-leaf"
    >
      <p className="font-leaf-medium text-leaf-primary">主题样式，直接复用</p>
      <p className="text-leaf-muted">颜色、圆角和间距都与组件保持一致。</p>
    </Flex>
  );
}
