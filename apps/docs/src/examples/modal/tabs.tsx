import { Button, Form, FormField, Input, Modal, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ModalTabs() {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState('general');

  return (
    <>
      <Button onClick={() => setOpen(true)}>项目配置</Button>
      <Modal
        open={open}
        title="项目配置"
        confirmText="保存"
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        tabs={{
          activeKey,
          onChange: setActiveKey,
          items: [
            {
              key: 'general',
              label: '基本信息',
              children: (
                <Form layout="vertical">
                  <FormField label="项目名称">
                    <Input name="name" defaultValue="Leaf UI" />
                  </FormField>
                </Form>
              ),
            },
            {
              key: 'notes',
              label: '变更说明',
              children: <Paragraph>切换标签页时会保留基本信息中的输入内容。</Paragraph>,
            },
          ],
        }}
      />
    </>
  );
}
