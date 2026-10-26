import { Button, Form, FormField, Input, Modal } from '@ifhover/leaf-ui';
import { Pencil } from 'lucide-react';
import { useId, useState } from 'react';

export function ModalDescription() {
  const [open, setOpen] = useState(false);
  const formId = useId();
  return (
    <>
      <Button onClick={() => setOpen(true)}>重命名文件</Button>
      <Modal
        open={open}
        title="重命名文件"
        description="新名称会用于文件列表和下载。"
        icon={<Pencil />}
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
          <FormField label="文件名" required>
            <Input name="filename" defaultValue="设计说明.md" />
          </FormField>
        </Form>
      </Modal>
    </>
  );
}
