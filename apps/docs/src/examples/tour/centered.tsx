import { Button, Tour } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TourCentered() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>查看欢迎说明</Button>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={[{ title: '欢迎使用', description: '接下来会介绍页面上的主要功能。' }]}
      />
    </>
  );
}
