import { Button, Input, Popover } from '@sudden3/leaf-ui';

export function PopoverBasic() {
  return (
    <div className="leaf-demo-row">
      <Popover
        title="项目信息"
        content={
          <div className="leaf-demo-stack">
            <Input aria-label="项目名称" defaultValue="Leaf Garden" />
            <Button>保存</Button>
          </div>
        }
        width={260}
      >
        <Button variant="outline">点击编辑</Button>
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
