import { Button, Form, FormField, Input, Modal, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ModalTabs() {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState('general');

  return (
    <>
      <Button onClick={() => setOpen(true)}>Project settings</Button>
      <Modal
        open={open}
        title="Project settings"
        confirmText="Save"
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        tabs={{
          activeKey,
          onChange: setActiveKey,
          items: [
            {
              key: 'general',
              label: 'General',
              children: (
                <Form layout="vertical">
                  <FormField label="Project name">
                    <Input name="name" defaultValue="Leaf UI" />
                  </FormField>
                </Form>
              ),
            },
            {
              key: 'notes',
              label: 'Notes',
              children: (
                <Paragraph>Input values in General remain preserved when switching tabs.</Paragraph>
              ),
            },
          ],
        }}
      />
    </>
  );
}
