import { Button, Drawer, Form, FormField, Input, Select } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function DrawerBasic() {
  const [placement, setPlacement] = useState<'left' | 'right' | 'top' | 'bottom'>('right');
  const [open, setOpen] = useState(false);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-row">
        {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
          <Button
            key={side}
            variant="outline"
            onClick={() => {
              setPlacement(side);
              setOpen(true);
            }}
          >
            {side}
          </Button>
        ))}
      </div>
      <Drawer
        open={open}
        placement={placement}
        title="项目设置"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" form="drawer-project">
              保存
            </Button>
          </>
        }
      >
        <Form
          id="drawer-project"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <FormField label="项目名称" required>
            <Input name="name" defaultValue="Leaf Garden" />
          </FormField>
          <FormField label="项目类型">
            <Select
              name="type"
              defaultValue="design"
              options={[
                { value: 'design', label: '设计项目' },
                { value: 'development', label: '开发项目' },
              ]}
            />
          </FormField>
        </Form>
      </Drawer>
    </div>
  );
}
