import { ConfigProvider, Switch } from '@ifhover/leaf-ui';

export function SwitchFixture() {
  return (
    <ConfigProvider theme={{ motion: false }} style={{ minHeight: 0 }}>
      <h1>Switch colors</h1>
      <section aria-label="Default switch palette" style={{ display: 'grid', gap: 12 }}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            <Switch size={size} aria-label={`${size} off`}>
              Off {size}
            </Switch>
            <Switch size={size} defaultChecked aria-label={`${size} on`}>
              On {size}
            </Switch>
          </div>
        ))}
        <Switch disabled aria-label="Disabled off">
          Disabled off
        </Switch>
        <Switch loading aria-label="Loading off">
          Loading off
        </Switch>
        <Switch loading defaultChecked aria-label="Loading on">
          Loading on
        </Switch>
      </section>
      <ConfigProvider
        theme={{
          appearance: 'light',
          tokens: { surfaceColor: '#f1e8de', mutedTextColor: '#736354', onPrimaryColor: '#111111' },
        }}
        style={{ minHeight: 0, marginBlock: 24 }}
      >
        <section aria-label="Nested switch palette" style={{ display: 'grid', gap: 12 }}>
          <Switch aria-label="Nested off">Nested off</Switch>
          <Switch defaultChecked aria-label="Nested on">
            Nested on
          </Switch>
        </section>
      </ConfigProvider>
      <ConfigProvider
        theme={{
          components: {
            Switch: {
              background: '#dce8f2',
              borderColor: '#325878',
              hover: { background: '#c3d8eb', borderColor: '#224260' },
              active: { background: '#aec9e0', borderColor: '#152d44' },
              focus: { background: '#e3eef7', borderColor: '#385f82' },
              disabled: { background: '#e8ecef', borderColor: '#7f8d99' },
            },
          },
        }}
        style={{ minHeight: 0 }}
      >
        <section aria-label="Switch overrides" style={{ display: 'grid', gap: 12 }}>
          <Switch aria-label="Override off">Override off</Switch>
          <Switch disabled aria-label="Override disabled">
            Override disabled
          </Switch>
        </section>
      </ConfigProvider>
      <ConfigProvider theme={{ tokens: { borderColor: '#986e55' } }} style={{ minHeight: 0 }}>
        <Switch aria-label="Global border">Global border</Switch>
      </ConfigProvider>
    </ConfigProvider>
  );
}
