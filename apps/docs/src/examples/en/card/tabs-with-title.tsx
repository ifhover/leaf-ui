import { Button, Card, Descriptions, Flex, Form, FormField, Input, Tag } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';

export function CardTabsWithTitle() {
  const [activeKey, setActiveKey] = useState('settings');
  const [saved, setSaved] = useState(false);
  const formId = useId();
  return (
    <Card
      title="Project settings"
      description="Manage project details and team members."
      extra={<Tag>{saved ? 'Saved' : 'Draft'}</Tag>}
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
                <FormField label="Contact email">
                  <Input name="email" type="email" defaultValue="team@example.com" required />
                </FormField>
              </Form>
            ),
          },
          {
            key: 'members',
            label: 'Members',
            children: (
              <Descriptions
                columns={1}
                items={[
                  { key: 'owner', label: 'Project lead', children: 'Rowan Lin' },
                  { key: 'designer', label: 'Designer', children: 'Alex Chen' },
                ]}
              />
            ),
          },
          { key: 'billing', label: 'Billing', disabled: true, children: null },
        ],
      }}
      footer={
        <Flex align="center" gap="sm" justify="end">
          <Button type="submit" form={formId} disabled={activeKey !== 'settings'}>
            Save changes
          </Button>
        </Flex>
      }
    />
  );
}
