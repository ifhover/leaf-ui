import { Button, Form, FormField, Input, Space, Tour } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function TourMaskless() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('Getting started');
  const input = useRef<HTMLInputElement>(null);
  return (
    <Space direction="vertical" align="stretch">
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormField label="Document title">
          <Input ref={input} value={title} onChange={(event) => setTitle(event.target.value)} />
        </FormField>
      </Form>
      <Space>
        <Button onClick={() => setOpen(true)}>Start maskless tour</Button>
      </Space>
      <Tour
        open={open}
        mask={false}
        onClose={() => setOpen(false)}
        steps={[
          {
            title: 'Edit the title',
            description: 'You can edit this field while the tour is open.',
            target: () => input.current,
          },
        ]}
      />
    </Space>
  );
}
