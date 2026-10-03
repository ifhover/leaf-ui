import { Button, Form, FormField, Input, Modal, Select } from '@sudden3/leaf-ui';
import { useRef, useState } from 'react';
export function ModalBasic() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit project</Button>
      <Modal
        open={open}
        title="Project settings"
        confirmText="Save"
        onClose={() => setOpen(false)}
        onConfirm={() => formRef.current?.requestSubmit()}
      >
        <Form
          ref={formRef}
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
