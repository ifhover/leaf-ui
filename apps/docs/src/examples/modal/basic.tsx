import { Button, Form, FormField, Input, Modal, Select } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function ModalBasic() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>编辑项目</Button>
      <Modal open={open} title="项目设置" onClose={() => setOpen(false)}>
        <Form
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
              options={[
                { value: 'design', label: '设计团队' },
                { value: 'engineering', label: '工程团队' },
              ]}
            />
          </FormField>
          <div className="leaf-demo-row">
            <Button type="submit">保存</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
