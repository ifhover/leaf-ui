import { Button, Form, FormField, Input, Modal } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';

export function ModalDestroy() {
  const [open, setOpen] = useState(false);
  const formId = useId();
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开临时草稿</Button>
      <Modal
        open={open}
        title="临时草稿"
        destroyOnClose
        confirmText="完成"
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
          <FormField label="草稿标题">
            <Input name="draft" defaultValue="新的草稿" />
          </FormField>
        </Form>
      </Modal>
    </>
  );
}
