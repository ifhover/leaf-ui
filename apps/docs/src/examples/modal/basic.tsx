import { Button, Form, FormField, Input, Modal } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';

export function ModalBasic() {
  const [open, setOpen] = useState(false);
  const formId = useId();
  return (
    <>
      <Button onClick={() => setOpen(true)}>编辑标题</Button>
      <Modal
        open={open}
        title="编辑标题"
        confirmText="保存"
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
          <FormField label="标题" required>
            <Input name="title" defaultValue="Leaf UI" />
          </FormField>
        </Form>
      </Modal>
    </>
  );
}
