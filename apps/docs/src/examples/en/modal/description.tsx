import { Button, Form, FormField, Input, Modal } from '@ifhover/leaf-ui';
import { Pencil } from 'lucide-react';
import { useId, useState } from 'react';

export function ModalDescription() {
  const [open, setOpen] = useState(false);
  const formId = useId();
  return (
    <>
      <Button onClick={() => setOpen(true)}>Rename file</Button>
      <Modal
        open={open}
        title="Rename file"
        description="The new name will appear in the file list and downloads."
        icon={<Pencil />}
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
          <FormField label="File name" required>
            <Input name="filename" defaultValue="Design notes.md" />
          </FormField>
        </Form>
      </Modal>
    </>
  );
}
