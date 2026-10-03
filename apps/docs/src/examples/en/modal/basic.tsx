import { Button, Form, FormField, Input, Modal, Select } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function ModalBasic() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit project</Button>
      <Modal open={open} title="Project settings" onClose={() => setOpen(false)}>
        <Form
          layout="vertical"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <FormField label="Project name" required>
            <Input name="name" defaultValue="Leaf UI" />
          </FormField>
          <FormField label="Owner">
            <Select
              options={[
                { value: 'design', label: 'Design team' },
                { value: 'engineering', label: 'Engineering team' },
              ]}
            />
          </FormField>
          <div className="leaf-demo-row">
            <Button type="submit">Save</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
