import { Button, Form, FormField, Input, Space, Tour } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function TourMaskless() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('快速开始');
  const input = useRef<HTMLInputElement>(null);
  return (
    <Space direction="vertical" align="stretch">
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormField label="文档标题">
          <Input ref={input} value={title} onChange={(event) => setTitle(event.target.value)} />
        </FormField>
      </Form>
      <Space>
        <Button onClick={() => setOpen(true)}>开始无蒙层引导</Button>
      </Space>
      <Tour
        open={open}
        mask={false}
        onClose={() => setOpen(false)}
        steps={[
          {
            title: '修改标题',
            description: '引导开启时，仍可在输入框中修改标题。',
            target: () => input.current,
          },
        ]}
      />
    </Space>
  );
}
