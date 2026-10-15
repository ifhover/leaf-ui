import { Button, Card, ConfigProvider, Flex, Switch } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ThemeAppearance() {
  const [dark, setDark] = useState(false);

  return (
    <ConfigProvider theme={{ appearance: dark ? 'dark' : 'light' }}>
      <Card>
        <Flex direction="column" gap="md" align="start">
          <Switch checked={dark} onChange={(event) => setDark(event.target.checked)}>
            Dark mode
          </Switch>
          <Button>Save changes</Button>
        </Flex>
      </Card>
    </ConfigProvider>
  );
}
