import { Flex, Switch, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SwitchControlled() {
  const [checked, setChecked] = useState(true);
  return (
    <Flex direction="column" gap="md" align="start">
      <Switch checked={checked} onChange={(event) => setChecked(event.target.checked)}>
        接收邮件
      </Switch>
      <Text tone="muted" role="status">
        {checked ? '邮件通知已开启' : '邮件通知已关闭'}
      </Text>
    </Flex>
  );
}
