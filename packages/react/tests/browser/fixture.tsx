/// <reference types="vite/client" />
import {
  Alert,
  AutoComplete,
  Breadcrumb,
  Button,
  Calendar,
  Carousel,
  CheckboxGroup,
  ColorPicker,
  ConfigProvider,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  Drawer,
  Dropdown,
  Form,
  FormField,
  Input,
  InputNumber,
  List,
  ListItem,
  Mentions,
  Menu,
  Progress,
  Select,
  Slider,
  Space,
  Splitter,
  Statistic,
  Steps,
  Tabs,
  TimePicker,
  Tree,
  Typography,
  VirtualList,
  type VirtualListHandle,
} from '@sudden3/leaf-ui';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Modal } from '../../src/modal';
import '../../src/styles/index.scss';
import css from '../../src/styles/index.scss?inline';
import './fixture.scss';
import { AccessibilityWorkbench } from '../../../../apps/docs/src/examples/scenarios/accessibility';
import { ColorFixture } from './color-fixture';
import { FeedbackFixture } from './feedback-fixture';
import { MotionFixture } from './motion-fixture';
import { RadiusFixture } from './radius-fixture';
import { SelectionFixture } from './selection-fixture';

const params = new URLSearchParams(location.search);
const options = [
  { value: 'alice', label: 'Alice' },
  { value: 'bob', label: 'Bob' },
];
const baseline = new Date(2026, 9, 5);
function Controls() {
  const [modal, setModal] = useState(false),
    [drawer, setDrawer] = useState(false);
  const [saved, setSaved] = useState('');
  const initialFocus = useRef<HTMLInputElement>(null);
  const [remote, setRemote] = useState(options);
  return (
    <>
      <Typography>
        <h1>Browser acceptance</h1>
      </Typography>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
        }}
      >
        <FormField label="People" required>
          <CheckboxGroup name="people" options={['Alice', 'Bob']} />
        </FormField>
        <FormField label="Remote person">
          <Select name="remote" defaultValue="alice" options={remote} allowClear showSearch />
        </FormField>
        <Button onClick={() => setRemote([{ value: 'charlie', label: 'Charlie' }])}>
          Replace options
        </Button>
        <FormField label="Suggestion">
          <AutoComplete
            name="suggestion"
            options={[{ value: 'Alice' }, { value: 'Bob' }]}
            allowClear
          />
        </FormField>
        <FormField label="Start date">
          <DatePicker name="date" defaultValue={baseline} format="DD/MM/YYYY" />
        </FormField>
        <FormField label="Period">
          <DateRangePicker name="period" defaultValue={[baseline, new Date(2026, 9, 10)]} />
        </FormField>
        <FormField label="Exact amount">
          <InputNumber stringMode name="amount" defaultValue="9007199254740993.01" step="0.01" />
        </FormField>
        <FormField label="Time">
          <TimePicker name="time" defaultValue="09:30" disabledTime={(time) => time.hour === 10} />
        </FormField>
        <FormField label="Notes">
          <Mentions
            name="notes"
            options={[
              { value: 'alice', label: 'Alice' },
              { value: 'bob', label: 'Bob' },
            ]}
          />
        </FormField>
        <Button type="submit">Save</Button>
        <Button type="reset" variant="outline">
          Reset
        </Button>
      </Form>
      <output data-testid="saved">{saved}</output>
      <Space className="fixture-control-row" style={{ marginBlock: 16 }}>
        <Button onClick={() => setModal(true)}>Open modal</Button>
        <Button onClick={() => setDrawer(true)}>Open drawer</Button>
        <Dropdown trigger="hover" items={[{ key: 'edit', label: 'Edit' }]}>
          <Button variant="outline">Hover actions</Button>
        </Dropdown>
        <Dropdown trigger="contextMenu" items={[{ key: 'copy', label: 'Copy' }]}>
          <Button variant="outline">Context actions</Button>
        </Dropdown>
      </Space>
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Edit person"
        initialFocus={initialFocus}
        destroyOnClose
      >
        <Input ref={initialFocus} aria-label="Modal name" />
        <Select aria-label="Modal person" options={options} showSearch />
      </Modal>
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Workspace"
        resizable
        minSize={240}
        maxSize={600}
      >
        <Input aria-label="Drawer note" />
      </Drawer>
      <Splitter
        style={{ height: 180 }}
        panels={[
          { key: 'a', min: 20, children: <Input aria-label="Left panel" /> },
          { key: 'b', min: 20, children: <Input aria-label="Right panel" /> },
        ]}
      />
      <Carousel style={{ height: 150 }} aria-label="Highlights">
        {[1, 2, 3].map((i) => (
          <div key={i} className="slide">
            <Button>Slide {i}</Button>
          </div>
        ))}
      </Carousel>
      <Slider aria-label="Priority" defaultValue={20} tooltip />
      <Tabs
        placement="bottom"
        items={[
          { key: 'a', label: 'First', children: 'First panel' },
          { key: 'b', label: 'Second', children: 'Second panel' },
        ]}
      />
    </>
  );
}
function SliderInteractions() {
  const marks = [
    { value: 0, label: 'Low' },
    { value: 50, label: 'Mid' },
    { value: 100, label: 'High' },
  ];
  return (
    <div style={{ maxWidth: 480 }}>
      <h1>Marked sliders</h1>
      <section aria-label="Single" style={{ marginBlock: 32 }}>
        <Slider aria-label="Single value" defaultValue={50} marks={marks} />
      </section>
      <section aria-label="Range" style={{ marginBlock: 32 }}>
        <Slider aria-label="Range value" range defaultValue={[20, 80]} marks={marks} />
      </section>
      <section aria-label="Vertical" style={{ marginBlock: 32 }}>
        <Slider aria-label="Vertical value" vertical defaultValue={50} marks={marks} />
      </section>
    </div>
  );
}
function Visual() {
  const [value, setValue] = useState(20);
  return (
    <>
      <Typography>
        <h1>Theme and direction</h1>
        <p>Keyboard, sizes, error and disabled states.</p>
      </Typography>
      <Space>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Button key={size} size={size} data-testid={`button-${size}`}>
            {size}
          </Button>
        ))}
      </Space>
      <Space style={{ marginBlock: 16 }}>
        <Input aria-label="Name" placeholder="Name" />
        <Input aria-label="Invalid name" status="error" defaultValue="Invalid" />
        <Input aria-label="Disabled name" disabled defaultValue="Disabled" />
      </Space>
      <Space className="fixture-control-row">
        <Select aria-label="Person" options={options} />
        <DatePicker aria-label="Date" defaultValue={baseline} />
        <DateTimePicker aria-label="Appointment" defaultValue={baseline} />
      </Space>
      <Space wrap>
        <ColorPicker showText />
        <ColorPicker mode="gradient" showText />
        <TimePicker aria-label="Time" style={{ width: 220 }} />
      </Space>
      <CheckboxGroup legend="Access" options={['Read', 'Write']} defaultValue={['Read']} />
      <Menu
        items={[
          { key: 'home', label: 'Home' },
          { key: 'team', label: 'Team', children: [{ key: 'people', label: 'People' }] },
        ]}
      />
      <Breadcrumb
        maxItems={3}
        items={['Home', 'Projects', 'Design', 'Tokens', 'Colors'].map((title) => ({ title }))}
      />
      <Tabs
        items={[
          { key: 'one', label: 'One', children: 'First panel' },
          { key: 'two', label: 'Two', children: 'Second panel' },
        ]}
      />
      <Steps
        progressDot
        percent={50}
        items={[{ title: 'Create' }, { title: 'Review' }, { title: 'Publish' }]}
        current={1}
      />
      <Slider
        aria-label="Value"
        value={value}
        onChange={setValue}
        marks={[
          { value: 0, label: 'Low' },
          { value: 100, label: 'High' },
        ]}
      />
      <Alert type="info" title="Information" description="A compact feedback example." />
      <Space>
        <Statistic title="Revenue" value={1234.5} precision={2} />
        <Progress type="circle" dashboard percent={65} />
      </Space>
      <List aria-label="People">
        <ListItem title="Alice" description="Design" />
        <ListItem title="Bob" description="Engineering" />
      </List>
      <Calendar defaultValue={baseline} />
    </>
  );
}
const large = Array.from({ length: 10_000 }, (_, i) => ({
  key: `row-${i}`,
  value: String(i),
  label: `Person ${String(i).padStart(5, '0')}`,
  title: `Node ${String(i).padStart(5, '0')}`,
}));
function LargeData() {
  const virtual = useRef<VirtualListHandle>(null);
  const [expanded, setExpanded] = useState(false),
    [reverse, setReverse] = useState(false);
  const items = reverse ? [...large].reverse() : large;
  return (
    <>
      <h1>10,000 items</h1>
      <Select aria-label="Large select" options={large} showSearch virtual listHeight={240} />
      <Tree aria-label="Large tree" data={large} virtual height={240} />
      <Button onClick={() => virtual.current?.scrollToIndex(5000, 'start')}>Jump</Button>
      <Button onClick={() => setExpanded(!expanded)}>Resize rows</Button>
      <Button onClick={() => setReverse(!reverse)}>Reverse rows</Button>
      <VirtualList
        ref={virtual}
        items={items}
        itemKey={(item) => item.key}
        height={240}
        estimateSize={44}
        renderItem={(item, i) => (
          <div style={{ padding: 8, minHeight: expanded && i % 3 === 0 ? 88 : 44 }}>
            <button type="button">{item.label}</button>
          </div>
        )}
      />
    </>
  );
}
function Shadow() {
  const host = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<ShadowRoot | null>(null);
  useEffect(() => {
    const root = host.current?.shadowRoot ?? host.current?.attachShadow({ mode: 'open' });
    if (root) setTarget(root);
  }, []);
  return (
    <div ref={host}>
      {target &&
        createPortal(
          <>
            <style>{css}</style>
            <ConfigProvider
              locale="en-US"
              direction="rtl"
              theme={{ primaryColor: '#7654c6' }}
              getPopupContainer={() => target}
            >
              <Select aria-label="Shadow person" options={options} />
              <ColorPicker showText />
            </ConfigProvider>
          </>,
          target,
        )}
    </div>
  );
}
const fixture = params.get('fixture');
const appearance = params.get('theme') === 'dark' ? 'dark' : 'light';
const root = document.getElementById('root');
if (!root) throw new Error('Missing fixture root');
createRoot(root).render(
  <ConfigProvider
    locale="en-US"
    direction={params.get('rtl') ? 'rtl' : 'ltr'}
    theme={
      params.get('tokens')
        ? {
            appearance,
            controlHeight: 38,
            borderRadius: 5,
            components: { Button: { borderRadius: 2 }, Input: { borderRadius: 3 } },
          }
        : { appearance }
    }
  >
    <main>
      {fixture === 'radius' ? (
        <RadiusFixture />
      ) : fixture === 'colors' ? (
        <ColorFixture />
      ) : fixture === 'accessibility' ? (
        <AccessibilityWorkbench english />
      ) : fixture === 'feedback' ? (
        <FeedbackFixture />
      ) : fixture === 'selection' ? (
        <SelectionFixture />
      ) : fixture === 'motion' ? (
        <MotionFixture />
      ) : fixture === 'large' ? (
        <LargeData />
      ) : fixture === 'visual' ? (
        <Visual />
      ) : fixture === 'sliders' ? (
        <SliderInteractions />
      ) : fixture === 'shadow' ? (
        <Shadow />
      ) : (
        <Controls />
      )}
    </main>
  </ConfigProvider>,
);
