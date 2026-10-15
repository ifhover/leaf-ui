import { Flex, Space, Switch, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SwitchControlled() {
  const [checked, setChecked] = useState(true);
  return (
    <Space direction="vertical" align="stretch">
      <Switch checked={checked} onChange={(event) => setChecked(event.target.checked)}>
        Receive email
      </Switch>
      <Text tone="muted" aria-live="polite">
        {checked ? 'Email notifications enabled' : 'Email notifications disabled'}
      </Text>
      <Flex gap="md" align="center" wrap justify="center">
        <Switch size="sm" defaultChecked>
          Small
        </Switch>
        <Switch defaultChecked>Default</Switch>
        <Switch size="lg" defaultChecked>
          Large
        </Switch>
      </Flex>
    </Space>
  );
}
