import { Button, Popover } from '@ifhover/leaf-ui';

export function PopoverHover() {
  return (
    <Popover title="项目信息" content="在此查看项目概览和最近更新。" trigger="hover">
      <Button variant="outline">悬停查看</Button>
    </Popover>
  );
}
