import { Button, Descriptions, Drawer, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DrawerTabs() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>View service details</Button>
      <Drawer
        open={open}
        title="API Gateway"
        onClose={() => setOpen(false)}
        tabs={{
          items: [
            {
              key: 'overview',
              label: 'Overview',
              children: (
                <Descriptions
                  items={[
                    { key: 'region', label: 'Region', children: 'us-east-1' },
                    { key: 'version', label: 'Version', children: 'v2.4.0' },
                    { key: 'owner', label: 'Owner', children: 'Platform team' },
                  ]}
                />
              ),
            },
            {
              key: 'changelog',
              label: 'Changelog',
              children: (
                <Paragraph>The latest release enabled automatic connection pool scaling.</Paragraph>
              ),
            },
          ],
        }}
      />
    </>
  );
}
