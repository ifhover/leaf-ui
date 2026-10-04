import { Button, Input, Popover } from '@sudden3/leaf-ui';
import { useId, useState } from 'react';
export function PopoverControlled() {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <Popover
      title="编辑项目"
      open={open}
      onOpenChange={setOpen}
      width={260}
      content={
        <div className="leaf-demo-stack">
          <label className="leaf-demo-field" htmlFor={id}>
            项目名称
            <Input id={id} defaultValue="Leaf Garden" />
          </label>
          <Button onClick={() => setOpen(false)}>保存并关闭</Button>
        </div>
      }
    >
      <Button variant="outline">点击编辑</Button>
    </Popover>
  );
}
