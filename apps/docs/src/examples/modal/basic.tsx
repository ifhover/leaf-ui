import { Button, Form, FormField, Input, Modal, Select } from '@sudden3/leaf-ui';
import { useRef, useState } from 'react';
export function ModalBasic() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <>
      <Button onClick={() => setOpen(true)}>编辑项目</Button>
      <Modal
        open={open}
        title="项目设置"
        confirmText="保存"
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
          <FormField label="项目名称" required>
            <Input name="name" defaultValue="Leaf UI" />
          </FormField>
          <FormField label="负责人">
            <Select
              name="owner"
              options={[
                { value: 'design', label: '设计团队' },
                { value: 'engineering', label: '工程团队' },
              ]}
            />
          </FormField>
        </Form>
      </Modal>
    </>
  );
}
