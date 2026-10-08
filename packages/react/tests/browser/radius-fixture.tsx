import {
  AutoComplete,
  Button,
  Cascader,
  ColorPicker,
  ConfigProvider,
  DateTimePicker,
  Dropdown,
  type LeafTheme,
  Mentions,
  Menu,
  Segmented,
  Select,
  Tabs,
  TimePicker,
  TimeRangePicker,
  Tree,
  TreeSelect,
} from '@sudden3/leaf-ui';
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
      Dropdown: { borderRadius: 18, padding: '3px 7px 5px 9px' },
      Segmented: { borderRadius: 14, padding: '2px 4px 6px 8px' },
      Tabs: { borderRadius: 14, padding: '2px 4px 6px 8px' },
      Menu: { borderRadius: 18, padding: '4px 6px 8px 10px' },
    };
  return (
    <ConfigProvider
      theme={theme}
      density={params.has('compact') ? 'compact' : 'comfortable'}
      className="radius-fixture"
    >
      <h1>Nested corner geometry</h1>
      <Button onClick={() => setRadius(radius === 10 ? 20 : 10)}>Change radius</Button>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr', marginBlock: 16 }}>
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
        <TimePicker aria-label="Radius time" defaultValue="09:00" />
        <TimeRangePicker aria-label="Radius time range" defaultValue={['09:00', '10:00']} />
        <DateTimePicker aria-label="Radius datetime" defaultValue={new Date(2026, 9, 8, 9)} />
        <Dropdown items={menu}>
          <Button>Radius dropdown</Button>
        </Dropdown>
        <ColorPicker aria-label="Radius color" defaultValue="#1265f5" showText />
      </div>
      <Segmented aria-label="Radius segmented" options={['Home', 'Team']} />
      <Tabs type="card" aria-label="Radius tabs" items={tabs} />
      <Menu aria-label="Radius menu" items={menu} defaultSelectedKey="home" />
      <Menu
        aria-label="Horizontal radius menu"
        mode="horizontal"
        items={menu}
        defaultSelectedKey="home"
      />
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
