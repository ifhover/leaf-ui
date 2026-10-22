import { Button, Form, FormField, Input, Modal, Select } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ModalCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open card dialog</Button>
      <Modal
        open={open}
        variant="card"
        title="Project settings"
        confirmText="Save"
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      >
        <Form layout="vertical">
          <FormField label="Project name" required>
            <Input name="name" defaultValue="Leaf UI" />
          </FormField>
          <FormField label="Owner">
            <Select
              name="owner"
              options={[
                { value: 'design', label: 'Design team' },
                { value: 'engineering', label: 'Engineering team' },
              ]}
            />
          </FormField>
        </Form>
      </Modal>
    </>
  );
}
