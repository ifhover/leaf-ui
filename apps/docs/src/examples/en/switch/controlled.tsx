import { Flex, Switch, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SwitchControlled() {
  const [checked, setChecked] = useState(true);
  return (
    <Flex direction="column" gap="md" align="start">
      <Switch checked={checked} onChange={(event) => setChecked(event.target.checked)}>
        Receive email
      </Switch>
      <Text tone="muted" role="status">
        {checked ? 'Email notifications enabled' : 'Email notifications disabled'}
      </Text>
    </Flex>
  );
}
