import { Button, Card, Flex, Form, FormField, Input, Text } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';

export function CardTabsWithTitle() {
  const [activeKey, setActiveKey] = useState('settings');
  const [saved, setSaved] = useState(false);
  const formId = useId();
  return (
    <Card
      title="Project settings"
      tabs={{
        activeKey,
        onChange: setActiveKey,
        items: [
          {
            key: 'settings',
            label: 'Details',
            children: (
              <Form
                id={formId}
                layout="vertical"
                onChange={() => setSaved(false)}
                onSubmit={(event) => {
                  event.preventDefault();
                  setSaved(true);
                }}
              >
                <FormField label="Project name">
                  <Input name="name" defaultValue="Leaf Design System" required />
                </FormField>
              </Form>
            ),
          },
          {
            key: 'notes',
            label: 'Notes',
            children: <Text>Save the project name from the Details tab after editing it.</Text>,
          },
        ],
      }}
      footer={
        <Flex align="center" gap="sm" justify="space-between" wrap>
          <Text role="status" tone="muted">
            {saved ? 'Saved' : 'Not saved'}
          </Text>
          <Button type="submit" form={formId} disabled={activeKey !== 'settings'}>
            Save changes
          </Button>
        </Flex>
      }
    />
  );
}
