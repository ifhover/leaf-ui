import { Button, Space, Text, Tour } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function TourBasic() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const title = useRef<HTMLSpanElement>(null);
  const visibility = useRef<HTMLSpanElement>(null);
  return (
    <Space direction="vertical" align="start">
      <Text ref={title}>Document: Getting started</Text>
      <Text ref={visibility}>Visibility: Only me</Text>
      <Button
        onClick={() => {
          setCurrent(0);
          setOpen(true);
        }}
      >
        Start tour
      </Button>
      <Tour
        open={open}
        current={current}
        onChange={setCurrent}
        onClose={() => setOpen(false)}
        steps={[
          {
            key: 'title',
            title: 'Document title',
            description: 'The name of the current document appears here.',
            target: () => title.current,
          },
          {
            key: 'visibility',
            title: 'Visibility',
            description: 'Before sharing, check who can view this document.',
            target: () => visibility.current,
          },
        ]}
      />
    </Space>
  );
}
