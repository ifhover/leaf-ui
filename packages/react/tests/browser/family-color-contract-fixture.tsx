import {
  Button,
  ColorPicker,
  ConfigProvider,
  DatePicker,
  Dropdown,
  Menu,
  Modal,
  Pagination,
  Splitter,
  Switch,
  Tabs,
} from '@ifhover/leaf-ui';
import { useState } from 'react';

function FamilySamples({ name }: { name: string }) {
  const [dialog, setDialog] = useState(false);
  return (
    <section aria-label={name} style={{ display: 'grid', gap: 16, padding: 16 }}>
      <Tabs
        type="segmented"
        items={[
          { key: 'first', label: 'First' },
          { key: 'next', label: 'Next' },
        ]}
      />
      <ColorPicker aria-label={`${name} color`} defaultValue="#336699" />
      <DatePicker aria-label={`${name} date`} panelVariant="card" />
      <DatePicker picker="time" aria-label={`${name} time`} defaultValue="10:30" />
      <Pagination total={50} />
      <Switch aria-label={`${name} switch`} />
      <Splitter
        panels={[
          { key: 'first', children: 'First pane' },
          { key: 'last', children: 'Last pane' },
        ]}
      />
      <Menu
        aria-label={`${name} menu`}
        items={[{ key: 'delete', label: 'Delete', danger: true }]}
      />
      <Dropdown items={[{ key: 'delete', label: 'Delete', danger: true }]}>
        <Button>{name} dropdown</Button>
      </Dropdown>
      <Button onClick={() => setDialog(true)}>{name} dialog</Button>
      <Modal variant="card" open={dialog} title={`${name} dialog`} onClose={() => setDialog(false)}>
        Canvas contract
      </Modal>
    </section>
  );
}

export function FamilyColorContractFixture() {
  return (
    <ConfigProvider theme={{ motion: false }} style={{ minHeight: 0 }}>
      <h1>Visual family color contracts</h1>
      <FamilySamples name="Default" />
      <ConfigProvider
        theme={{
          appearance: 'light',
          primaryColor: '#b32a76',
          tokens: { surfaceColor: '#f1e8de', mutedSurfaceColor: '#dacdbf', borderColor: '#917b67' },
        }}
        style={{ minHeight: 0 }}
      >
        <FamilySamples name="Nested" />
      </ConfigProvider>
      <ConfigProvider
        theme={{ components: { Tabs: { background: '#213141', color: '#fefefe' } } }}
        style={{ minHeight: 0 }}
      >
        <FamilySamples name="Override" />
      </ConfigProvider>
    </ConfigProvider>
  );
}
