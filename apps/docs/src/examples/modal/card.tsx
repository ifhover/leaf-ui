import { Button, Form, FormField, Input, Modal, Select } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ModalCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开卡片弹窗</Button>
      <Modal
        open={open}
        variant="card"
        title="项目设置"
        confirmText="保存"
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      >
        <Form layout="vertical">
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
