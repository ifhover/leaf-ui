import { Button, ConfigProvider, Flex, Switch } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TailwindTheme() {
  const [dark, setDark] = useState(false);

  return (
    <Flex direction="column" gap="md">
      <Switch checked={dark} onChange={(event) => setDark(event.target.checked)}>
        深色模式
      </Switch>
      <ConfigProvider theme={{ primaryColor: '#7654c6', appearance: dark ? 'dark' : 'light' }}>
        <Flex
          direction="column"
          align="start"
          gap="md"
          className="rounded-leaf border border-leaf-border bg-leaf-surface p-leaf-md font-leaf text-leaf"
        >
          <p className="text-leaf-primary">工具类与组件使用同一份主题</p>
          <p className="text-leaf-muted">背景、文字和边框会一起切换。</p>
          <Button>Leaf UI 按钮</Button>
        </Flex>
      </ConfigProvider>
    </Flex>
  );
}
