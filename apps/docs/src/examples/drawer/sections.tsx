import { Button, Drawer, Form, FormField, Input } from '@ifhover/leaf-ui';
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
        description="新名称会同步应用到文档列表与分享链接。"
        divided
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button variant="solid" type="submit" form={formId}>
              保存
            </Button>
          </>
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
