import { Button, Space, Text, Tour } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function TourBasic() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const title = useRef<HTMLSpanElement>(null);
  const visibility = useRef<HTMLSpanElement>(null);
  return (
    <Space direction="vertical" align="start">
      <Text ref={title}>文档：快速开始</Text>
      <Text ref={visibility}>可见范围：仅自己</Text>
      <Button
        onClick={() => {
          setCurrent(0);
          setOpen(true);
        }}
      >
        开始引导
      </Button>
      <Tour
        open={open}
        current={current}
        onChange={setCurrent}
        onClose={() => setOpen(false)}
        steps={[
          {
            key: 'title',
            title: '文档标题',
            description: '当前文档的名称显示在这里。',
            target: () => title.current,
          },
          {
            key: 'visibility',
            title: '可见范围',
            description: '分享前，先确认谁可以查看这份文档。',
            target: () => visibility.current,
          },
        ]}
      />
    </Space>
  );
}
