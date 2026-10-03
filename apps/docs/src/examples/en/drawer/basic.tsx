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
        title="Project settings"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="drawer-project">
              Save
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
          <FormField label="Project name" required>
            <Input name="name" defaultValue="Leaf Garden" />
          </FormField>
          <FormField label="Project type">
            <Select
              name="type"
              defaultValue="design"
              options={[
                { value: 'design', label: 'Design' },
                { value: 'development', label: 'Development' },
              ]}
            />
          </FormField>
        </Form>
      </Drawer>
    </div>
  );
}
