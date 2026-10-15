import { Button, ConfigProvider, Flex, Switch } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TailwindTheme() {
  const [dark, setDark] = useState(false);

  return (
    <Flex direction="column" gap="md">
      <Switch checked={dark} onChange={(event) => setDark(event.target.checked)}>
        Dark mode
      </Switch>
      <ConfigProvider theme={{ primaryColor: '#7654c6', appearance: dark ? 'dark' : 'light' }}>
        <Flex
          direction="column"
          align="start"
          gap="md"
          className="rounded-leaf border border-leaf-border bg-leaf-surface p-leaf-md font-leaf text-leaf"
        >
          <p className="text-leaf-primary">Utilities and components share a theme</p>
          <p className="text-leaf-muted">Backgrounds, text and borders change together.</p>
          <Button>Leaf UI button</Button>
        </Flex>
      </ConfigProvider>
    </Flex>
  );
}
