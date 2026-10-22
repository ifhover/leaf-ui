import { Button, Tour } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function TourCentered({ english = false }: { english?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {english ? 'Show welcome' : '查看欢迎说明'}
      </Button>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={[
          {
            title: english ? 'Welcome to Leaf' : '欢迎来到 Leaf',
            description: english
              ? 'A step without a target is displayed in the center.'
              : '未指定目标的说明会显示在页面中央。',
          },
        ]}
      />
    </>
  );
}
