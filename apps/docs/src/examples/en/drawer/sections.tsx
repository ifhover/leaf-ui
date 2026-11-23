import { Button, Drawer, Form, FormField, Input } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';

export function DrawerSections() {
  const [open, setOpen] = useState(false);
  const formId = useId();
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit name</Button>
      <Drawer
        open={open}
        title="Edit name"
        description="The updated name appears in document lists and shared links."
        divided
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="solid" type="submit" form={formId}>
              Save
            </Button>
          </>
        }
      >
        <Form
          id={formId}
          layout="vertical"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <FormField label="Name" required>
            <Input name="name" defaultValue="Leaf UI" />
          </FormField>
        </Form>
      </Drawer>
    </>
  );
}
