import { Button, Drawer, Form, FormField, Input, Space } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';

export function DrawerSections() {
  const [open, setOpen] = useState(false);
  const formId = useId();
  return (
    <>
      <Button onClick={() => setOpen(true)}>编辑名称</Button>
      <Drawer
        open={open}
        title="编辑名称"
        onClose={() => setOpen(false)}
        footer={
          <Space wrap>
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button variant="solid" type="submit" form={formId}>
              保存
            </Button>
          </Space>
        }
      >
        <Form
          id={formId}
          layout="vertical"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <FormField label="名称" required>
            <Input name="name" defaultValue="Leaf UI" />
          </FormField>
        </Form>
      </Drawer>
    </>
  );
}
