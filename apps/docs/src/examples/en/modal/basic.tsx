import { Button, Form, FormField, Input, Modal } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';

export function ModalBasic() {
  const [open, setOpen] = useState(false);
  const formId = useId();
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit title</Button>
      <Modal
        open={open}
        title="Edit title"
        confirmText="Save"
        onClose={() => setOpen(false)}
        confirmButtonProps={{ type: 'submit', form: formId }}
      >
        <Form
          id={formId}
          layout="vertical"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <FormField label="Title" required>
            <Input name="title" defaultValue="Leaf UI" />
          </FormField>
        </Form>
      </Modal>
    </>
  );
}
