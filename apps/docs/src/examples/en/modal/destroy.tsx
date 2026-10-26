import { Button, Form, FormField, Input, Modal } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';

export function ModalDestroy() {
  const [open, setOpen] = useState(false);
  const formId = useId();
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open temporary draft</Button>
      <Modal
        open={open}
        title="Temporary draft"
        destroyOnClose
        confirmText="Done"
        confirmButtonProps={{ type: 'submit', form: formId }}
        onClose={() => setOpen(false)}
      >
        <Form
          id={formId}
          layout="vertical"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <FormField label="Draft title">
            <Input name="draft" defaultValue="New draft" />
          </FormField>
        </Form>
      </Modal>
    </>
  );
}
