import { Flex } from '@ifhover/leaf-ui';

export function TailwindBasic() {
  return (
    <Flex
      direction="column"
      gap="sm"
      className="rounded-leaf border border-leaf-border bg-leaf-surface p-leaf-md font-leaf text-leaf"
    >
      <p className="font-leaf-medium text-leaf-primary">Reuse your theme styles</p>
      <p className="text-leaf-muted">Share colors, radii and spacing with components.</p>
    </Flex>
  );
}
