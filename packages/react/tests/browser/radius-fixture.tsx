import {
  AutoComplete,
  Button,
  Card,
  Cascader,
  ColorPicker,
  ConfigProvider,
  DatePicker,
  DateRangePicker,
  Dropdown,
  type LeafTheme,
  Mentions,
  Menu,
  Select,
  Tabs,
  Tree,
  TreeSelect,
} from '@ifhover/leaf-ui';
import { useState } from 'react';

const people = [
  { value: 'alice', label: 'Alice' },
  { value: 'bob', label: 'Bob' },
];
const menu = [
  { key: 'home', label: 'Home' },
  { key: 'team', label: 'Team' },
];
const tabs = [
  { key: 'home', label: 'Home', children: 'Home content' },
  { key: 'team', label: 'Team', children: 'Team content' },
];

export function RadiusFixture() {
  const params = new URLSearchParams(location.search);
  const [radius, setRadius] = useState(Number(params.get('radius') ?? 10));
  const [open, setOpen] = useState(false);
  const theme: LeafTheme = { motion: false, borderRadius: radius };
  if (params.has('overrides'))
    theme.components = {
      Floating: { borderRadius: 24, padding: '4px 8px 6px 10px' },
      Select: { borderRadius: 14 },
      AutoComplete: { borderRadius: 12 },
      Textarea: { borderRadius: 16 },
      TreeSelect: { borderRadius: 13 },
      Cascader: { borderRadius: 15 },
      DatePicker: { borderRadius: 11 },
      ColorPicker: { borderRadius: 17 },
      Dropdown: { borderRadius: 18, padding: '3px 7px 5px 9px' },
      Tabs: { borderRadius: 14, padding: '2px 4px 6px 8px' },
      Menu: { borderRadius: 18, padding: '4px 6px 8px 10px' },
    };
  return (
    <ConfigProvider
      theme={theme}
      direction={params.has('rtl') ? 'rtl' : 'ltr'}
      density={params.has('compact') ? 'compact' : 'comfortable'}
      className="radius-fixture"
    >
      <h1>Nested corner geometry</h1>
      <Button onClick={() => setRadius(radius === 10 ? 20 : 10)}>Change radius</Button>
      <Card title="Fields inside a content surface" style={{ marginBlock: 16 }}>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
          <Select aria-label="Radius select" defaultValue="alice" options={people} />
          <AutoComplete aria-label="Radius autocomplete" defaultValue="alice" options={people} />
          <Mentions aria-label="Radius mentions" options={people} />
          <TreeSelect aria-label="Radius tree" defaultValue="alice" options={people} />
          <Cascader
            aria-label="Radius cascader"
            defaultValue={['design', 'ux']}
            options={[
              { value: 'design', label: 'Design', children: [{ value: 'ux', label: 'UX' }] },
              { value: 'engineering', label: 'Engineering' },
            ]}
          />
          <DatePicker
            aria-label="Radius date"
            defaultValue={new Date(2026, 9, 8)}
            panelVariant={params.has('card') ? 'card' : 'plain'}
          />
          <DateRangePicker
            aria-label="Radius date range"
            defaultValue={[new Date(2026, 9, 8), new Date(2026, 9, 12)]}
            panelVariant={params.has('card') ? 'card' : 'plain'}
          />
          <DatePicker
            picker="time"
            aria-label="Radius time"
            defaultValue="09:00"
            panelVariant={params.has('card') ? 'card' : 'plain'}
          />
          <DateRangePicker
            picker="time"
            aria-label="Radius time range"
            defaultValue={['09:00', '10:00']}
            panelVariant={params.has('card') ? 'card' : 'plain'}
          />
          <DatePicker
            picker="datetime"
            aria-label="Radius datetime"
            defaultValue={new Date(2026, 9, 8, 9)}
            panelVariant={params.has('card') ? 'card' : 'plain'}
          />
          <Dropdown items={menu}>
            <Button>Radius dropdown</Button>
          </Dropdown>
          <ColorPicker aria-label="Radius color" defaultValue="#1265f5" showText />
          <ColorPicker aria-label="Radius gradient" mode="gradient" showText />
        </div>
      </Card>
      <Tabs type="card" aria-label="Radius tabs" items={tabs} />
      <Menu aria-label="Radius menu" items={menu} defaultSelectedKey="home" />
      <Tree aria-label="Independent tree" data={[{ key: 'alice', title: 'Alice' }]} />
      <ConfigProvider
        theme={{ borderRadius: 4, components: { Floating: { borderRadius: 12, padding: 2 } } }}
      >
        <Select
          aria-label="Nested radius select"
          defaultValue="alice"
          options={people}
          open={open}
          onOpenChange={setOpen}
        />
        <Button onClick={() => setRadius(20)}>Change outer theme</Button>
      </ConfigProvider>
    </ConfigProvider>
  );
}
