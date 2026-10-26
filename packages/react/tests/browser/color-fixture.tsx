import { Button, Checkbox, ConfigProvider, Select, Slider, Switch, Tag } from '@ifhover/leaf-ui';
import { type CSSProperties, useState } from 'react';

export function ColorFixture() {
  const [changed, setChanged] = useState(false);
  return (
    <div
      data-testid="color-parent"
      style={
        {
          '--demo-accent': changed ? '#0000ff' : '#ff0000',
          '--demo-surface': changed ? '#000000' : '#ffffff',
        } as CSSProperties
      }
    >
      <Button onClick={() => setChanged(!changed)}>Change custom palette</Button>
      <ConfigProvider
        data-testid="variable-theme"
        theme={{
          primaryColor: 'var(--demo-accent)',
          tokens: { surfaceColor: 'var(--demo-surface)' },
        }}
      >
        <Button>Custom primary</Button>
        <Tag data-testid="variable-tag" color="var(--demo-accent)">
          Custom tag
        </Tag>
      </ConfigProvider>
      <DarkPrimaryColors />
    </div>
  );
}

function DarkPrimaryColors() {
  const [dark, setDark] = useState(true);
  const [primary, setPrimary] = useState('#18181b');
  return (
    <section style={{ '--dark-accent': primary } as CSSProperties}>
      <Button onClick={() => setDark(!dark)}>Toggle accent appearance</Button>
      <Button onClick={() => setPrimary(primary === '#18181b' ? '#1d9bf0' : '#18181b')}>
        Toggle accent color
      </Button>
      <ConfigProvider
        data-testid="dark-primary-theme"
        theme={{
          primaryColor: primary,
          appearance: dark ? 'dark' : 'light',
          tokens: {
            surfaceColor: dark ? '#1c1c20' : '#ffffff',
            mutedSurfaceColor: dark ? '#25252b' : '#f6f6f7',
          },
        }}
      >
        <Button variant="solid">Adaptive primary</Button>
        <Button variant="link">Adaptive link</Button>
        <Checkbox defaultChecked>Adaptive checkbox</Checkbox>
        <Switch defaultChecked aria-label="Adaptive switch" />
        <Slider defaultValue={50} aria-label="Adaptive slider" />
        <Tag color="primary">Adaptive tag</Tag>
        <Select
          aria-label="Adaptive select"
          options={[{ value: 'one', label: 'One' }]}
          defaultValue="one"
        />
        <ConfigProvider data-testid="inherited-primary-theme">
          <Button variant="solid">Inherited primary</Button>
        </ConfigProvider>
        <ConfigProvider data-testid="light-primary-theme" theme={{ appearance: 'light' }}>
          <Button variant="solid">Light primary</Button>
        </ConfigProvider>
        <ConfigProvider
          data-testid="explicit-primary-theme"
          theme={{ tokens: { onPrimaryColor: '#123456', primaryHoverColor: '#abcdef' } }}
        >
          <Button variant="solid">Explicit primary ink</Button>
        </ConfigProvider>
      </ConfigProvider>
    </section>
  );
}
