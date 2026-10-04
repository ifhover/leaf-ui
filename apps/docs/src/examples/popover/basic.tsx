import { Button, Popover } from '@sudden3/leaf-ui';
export function PopoverBasic() {
  return (
    <div className="leaf-demo-row">
      <Popover title="项目信息" content="在此查看项目概览和最近更新。">
        <Button variant="outline">点击查看</Button>
      </Popover>
      <Popover
        title="提示"
        trigger="hover"
        placement="right"
        content="这里可以查看项目的更多说明。"
      >
        <Button variant="soft">悬停查看</Button>
      </Popover>
    </div>
  );
}
