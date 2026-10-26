import { Button, Popover } from '@ifhover/leaf-ui';

export function PopoverBasic() {
  return (
    <Popover title="项目信息" content="在此查看项目概览和最近更新。">
      <Button variant="outline">点击查看</Button>
    </Popover>
  );
}
