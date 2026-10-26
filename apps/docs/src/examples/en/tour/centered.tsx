import { Button, Tour } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TourCentered() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Show welcome</Button>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={[
          {
            title: 'Welcome',
            description: 'The next steps introduce the main features on this page.',
          },
        ]}
      />
    </>
  );
}
