import { Button, Tooltip } from '@ifhover/leaf-ui';

export function TooltipBasic() {
  return (
    <Tooltip content="保存当前项目的修改">
      <Button variant="outline">保存</Button>
    </Tooltip>
  );
}
