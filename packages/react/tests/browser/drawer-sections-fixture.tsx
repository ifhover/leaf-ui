import { Alert, Button, Drawer, RadioGroup, Space } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';
import { useState } from 'react';

export function DrawerSectionsFixture() {
  const [open, setOpen] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  return (
    <>
      <Button variant="outline" startIcon={<Bell />} onClick={() => setOpen(true)}>
        Notification preferences
      </Button>
      <Drawer
        open={open}
        width={440}
        title="Notification preferences"
        description="Choose the right update frequency for you."
        icon={<Bell />}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </>
        }
      >
        <Space direction="vertical" align="stretch" size={20}>
          <RadioGroup
            variant="list"
            label="Activity summary"
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
            options={[
              {
                value: 'daily',
                label: 'Daily',
                description: 'A daily team activity digest',
              },
              {
                value: 'weekly',
                label: 'Weekly',
                description: 'A summary every Monday',
              },
              {
                value: 'off',
                label: 'No summary',
                description: 'Receive only important updates',
              },
            ]}
          />
          <Alert
            type="info"
            title="Important alerts stay enabled"
            description="Security events and actions requiring your attention are always delivered."
          />
        </Space>
      </Drawer>
    </>
  );
}
