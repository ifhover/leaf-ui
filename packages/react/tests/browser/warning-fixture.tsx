import {
  Alert,
  Badge,
  Button,
  ConfigProvider,
  Input,
  Popconfirm,
  Result,
  Space,
  Tag,
  useConfirm,
  useMessage,
  useNotification,
} from '@ifhover/leaf-ui';
import { useState } from 'react';

function WarningFeedback() {
  const { confirm } = useConfirm();
  const { message } = useMessage();
  const notification = useNotification();
  return (
    <Space direction="vertical" align="stretch" style={{ maxWidth: 700 }}>
      <Alert title="Warning notice" type="warning" />
      <Input aria-label="Warning field" status="warning" />
      <Space>
        <Tag color="warning">Warning label</Tag>
        <Tag color="warning" variant="outline">
          Outlined warning
        </Tag>
        <Tag color="warning" variant="solid">
          Solid warning
        </Tag>
        <Badge status="warning" text="Warning badge" />
      </Space>
      <Space>
        <Button
          onClick={() =>
            void confirm({
              title: 'Warning confirmation',
              children: 'Continue with this action?',
              type: 'warning',
            })
          }
        >
          Confirm warning
        </Button>
        <Button variant="outline" onClick={() => message.warning('Warning message', 0)}>
          Message warning
        </Button>
        <Button
          variant="outline"
          onClick={() => notification.warning({ title: 'Warning notification', duration: 0 })}
        >
          Notification warning
        </Button>
        <Popconfirm title="Warning popconfirm">
          <Button variant="outline">Popconfirm warning</Button>
        </Popconfirm>
      </Space>
      <Result status="warning" title="Warning result" />
    </Space>
  );
}

export function WarningFixture() {
  const [custom, setCustom] = useState(false);
  return (
    <ConfigProvider theme={{ tokens: custom ? { warningColor: '#e8580c' } : undefined }}>
      <h1>Warning colors</h1>
      <Button variant="outline" onClick={() => setCustom(!custom)}>
        Change warning color
      </Button>
      <WarningFeedback />
    </ConfigProvider>
  );
}
