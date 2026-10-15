import { Flex, Space, Switch, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SwitchControlled() {
  const [checked, setChecked] = useState(true);
  return (
    <Space direction="vertical" align="stretch">
      <Switch checked={checked} onChange={(event) => setChecked(event.target.checked)}>
        接收邮件
      </Switch>
      <Text tone="muted" aria-live="polite">
        {checked ? '邮件通知已开启' : '邮件通知已关闭'}
      </Text>
      <Flex gap="md" align="center" wrap justify="center">
        <Switch size="sm" defaultChecked>
          小尺寸
        </Switch>
        <Switch defaultChecked>默认尺寸</Switch>
        <Switch size="lg" defaultChecked>
          大尺寸
        </Switch>
      </Flex>
    </Space>
  );
}
