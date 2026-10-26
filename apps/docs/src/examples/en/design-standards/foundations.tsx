import {
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Flex,
  Form,
  FormField,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Text,
} from '@ifhover/leaf-ui';
import { useState } from 'react';

export function FoundationPreview() {
  const [primaryColor, setPrimaryColor] = useState('#1e964f');
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <Space direction="vertical" align="stretch" size={24}>
      <Flex align="center" justify="space-between" gap={16} wrap>
        <Select
          aria-label="Theme color"
          value={primaryColor}
          onChange={setPrimaryColor}
          options={[
            { value: '#1e964f', label: 'Leaf green' },
            { value: '#4c705c', label: 'Sage green' },
            { value: '#3568b0', label: 'Blue' },
            { value: '#7654c6', label: 'Purple' },
          ]}
          style={{ width: 144 }}
        />
        <Switch checked={dark} onChange={(event) => setDark(event.target.checked)}>
          Dark appearance
        </Switch>
      </Flex>
      <ConfigProvider theme={{ primaryColor, appearance: dark ? 'dark' : 'light' }}>
        <Card>
          <Space direction="vertical" align="stretch" size={24}>
            <Form layout="vertical">
              <FormField label="Name">
                <Input placeholder="Enter a name" />
              </FormField>
              <FormField label="Delivery">
                <Select
                  defaultValue="queue"
                  options={[
                    { value: 'queue', label: 'Queue messages' },
                    { value: 'immediate', label: 'Send immediately' },
                  ]}
                />
              </FormField>
            </Form>
            <Flex align="center" justify="space-between" gap={16} wrap>
              <Checkbox>Remember selection</Checkbox>
              <Switch defaultChecked>Show suggestions</Switch>
            </Flex>
            <Flex justify="end" gap={8} wrap>
              <Button>Outlined</Button>
              <Button danger>Danger action</Button>
              <Button variant="link">Text action</Button>
              <Button variant="solid" onClick={() => setOpen(true)}>
                Open dialog
              </Button>
            </Flex>
            <Modal
              open={open}
              title="Save changes?"
              description="Spacing separates dialog sections, with a shared surface for content and actions."
              confirmText="Save changes"
              onClose={() => setOpen(false)}
            >
              <Text tone="muted">Confirm to apply the current settings.</Text>
            </Modal>
          </Space>
        </Card>
      </ConfigProvider>
    </Space>
  );
}
