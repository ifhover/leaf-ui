import {
  BackTop,
  Button,
  ButtonGroup,
  ConfigProvider,
  FileList,
  FloatButton,
  FloatButtonGroup,
  Input,
  Loading,
  Modal,
  Select,
  Tabs,
  TimeRangePicker,
} from '@ifhover/leaf-ui';
import { Plus } from 'lucide-react';
import { type CSSProperties, useRef, useState } from 'react';
import { AppBarBasic } from '../../../../apps/docs/src/examples/app-bar/basic';
import { useListMotion } from '../../src/shared/motion';

function AnimatedRows({ rows }: { rows: string[] }) {
  const root = useRef<HTMLUListElement>(null);
  useListMotion(root, rows);
  return (
    <ul ref={root} aria-label="Animated rows" style={{ listStyle: 'none', padding: 0 }}>
      {rows.map((row) => (
        <li key={row} data-motion-key={row} style={{ height: 48 }}>
          {row}
        </li>
      ))}
    </ul>
  );
}

export function MotionFixture() {
  const [enabled, setEnabled] = useState(true);
  const [tab, setTab] = useState('a');
  const [view, setView] = useState('one');
  const [rows, setRows] = useState(['Alpha', 'Beta', 'Gamma']);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(false);
  const [step, setStep] = useState(false);
  const [tall, setTall] = useState(false);
  const name = useRef<HTMLInputElement>(null);
  return (
    <div className="motion-fixture">
      <h1>Motion acceptance</h1>
      <Button onClick={() => setEnabled(!enabled)}>Toggle motion</Button>
      <ConfigProvider
        data-testid="motion-scope"
        theme={{ motion: enabled, tokens: { motionDuration: 360 } }}
      >
        <div style={{ display: 'flex', gap: 12, marginBlock: 16 }}>
          {(['solid', 'outline', 'link'] as const).map((variant) => (
            <Button key={variant} variant={variant} data-testid={`press-${variant}`}>
              {variant}
            </Button>
          ))}
          <ButtonGroup attached>
            <Button data-testid="press-group-first">First action</Button>
            <Button data-testid="press-group-last">Last action</Button>
          </ButtonGroup>
          <Button data-testid="press-disabled" disabled>
            Disabled action
          </Button>
          <Button data-testid="press-loading" loading>
            Loading action
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBlock: 16 }}>
          <Button variant="outline" disabled data-testid="press-disabled-outline">
            Disabled outline
          </Button>
          <Button variant="outline" loading data-testid="press-loading-outline">
            Loading outline
          </Button>
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  hover: { borderColor: '#a31010' },
                  active: { color: '#12695f', borderColor: '#7654c6' },
                },
              },
            }}
          >
            <Button variant="outline" data-testid="press-component-outline">
              Component state overrides
            </Button>
          </ConfigProvider>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBlock: 16 }}>
          <Button danger variant="solid" data-testid="press-danger">
            Danger action
          </Button>
          <Button danger variant="outline" data-testid="press-danger-outline">
            Danger outline
          </Button>
          <Button startIcon={<Plus />} aria-label="Add action" data-testid="press-icon" />
          <ConfigProvider theme={{ primaryColor: '#2563eb', borderRadius: 24 }}>
            <Button variant="solid" data-testid="press-custom">
              Custom rounded action
            </Button>
          </ConfigProvider>
          <FloatButton
            fixed={false}
            aria-label="Floating action"
            startIcon={<Plus />}
            data-testid="press-float"
          />
          <BackTop
            visibilityHeight={0}
            data-testid="press-backtop"
            style={{ position: 'relative', insetInlineEnd: 'auto', bottom: 'auto' }}
          />
        </div>
        <ConfigProvider
          style={{ '--button-primary': '#2563eb' } as CSSProperties}
          theme={{
            primaryColor: 'var(--button-primary)',
            tokens: {
              primaryHoverColor: '#7c3aed',
              primaryActiveColor: '#4c1d95',
              dangerHoverColor: '#e11d48',
              dangerActiveColor: '#9f1239',
            },
          }}
        >
          <div style={{ display: 'flex', gap: 12, marginBlock: 16 }}>
            <Button variant="solid" data-testid="press-override-solid">
              Custom state colors
            </Button>
            <Button variant="outline" data-testid="press-override-outline">
              Custom outline state colors
            </Button>
            <Button danger variant="solid" data-testid="press-override-danger">
              Custom danger state colors
            </Button>
          </div>
        </ConfigProvider>
        <div
          data-testid="wave-scroll-frame"
          style={{ width: 240, maxHeight: 50, overflow: 'auto' }}
        >
          <Button fullWidth data-testid="press-scroll">
            Full-width scrolling action
          </Button>
        </div>
        <AppBarBasic english />
        <Button onClick={() => setRows((items) => [...items].reverse())}>Reverse</Button>
        <Button onClick={() => setRows((items) => [...items.slice(1), ...items.slice(0, 1)])}>
          Rotate
        </Button>
        <AnimatedRows rows={rows} />
        <FileList
          data-testid="animated-files"
          items={rows.map((item) => ({
            uid: `file-${item}`,
            name: `${item}.txt`,
            status: item === 'Alpha' ? 'cancelled' : 'done',
          }))}
        />
        <FloatButtonGroup
          className="motion-fixture-actions"
          defaultOpen
          actions={[
            { key: 'first', label: 'First quick action' },
            { key: 'second', label: 'Second quick action' },
          ]}
        />
        <Tabs
          aria-label="Animated tabs"
          activeKey={tab}
          onChange={setTab}
          items={[
            {
              key: 'a',
              label: 'Short',
              children: <Input aria-label="Retained name" defaultValue="original" />,
            },
            {
              key: 'b',
              label: 'Longer content',
              children: <div style={{ height: 160 }}>More content</div>,
            },
            {
              key: 'c',
              label: 'Final',
              children: <div style={{ height: 100 }}>Final content</div>,
            },
          ]}
        />
        <Tabs
          type="card"
          aria-label="Animated view tabs"
          activeKey={view}
          onChange={setView}
          items={['one', 'two', 'three'].map((key) => ({ key, label: key }))}
        />
        <label htmlFor="motion-portal">Portal field label</label>
        <Select
          id="motion-portal"
          aria-label="Animated portal"
          options={[
            { value: 'one', label: 'Option one' },
            { value: 'two', label: 'Option two' },
          ]}
        />
        <Select
          aria-label="Upward portal"
          popupPlacement="top-end"
          options={[{ value: 'one', label: 'Upward option' }]}
        />
        <TimeRangePicker aria-label="Local time range" defaultValue={['09:00', '18:00']} />
        <div style={{ marginBlock: 16 }}>
          <Button data-testid="busy-button" loading={busy}>
            Save changes
          </Button>
          <Button onClick={() => setBusy(!busy)}>Toggle loading</Button>
        </div>
        <Button
          onClick={() => {
            setTall(false);
            setStep(false);
            setModal(true);
          }}
        >
          Open morphing modal
        </Button>
        <Button
          onClick={() => {
            setTall(true);
            setStep(false);
            setModal(true);
          }}
        >
          Open tall modal
        </Button>
        <Modal
          open={modal}
          onClose={() => setModal(false)}
          title="Morphing modal"
          initialFocus={name}
          footer={
            <Button data-testid="press-portal" onClick={() => setStep(!step)}>
              Change modal step
            </Button>
          }
        >
          <div style={{ minHeight: step ? 210 : tall ? 800 : 40 }}>
            <Input ref={name} aria-label="Retained modal name" />
            <p>{step ? 'Details for the next step' : 'First step'}</p>
          </div>
        </Modal>
        <Loading data-testid="main-spinner" />
        <ConfigProvider data-testid="off-scope" theme={{ motion: false }}>
          <Button data-testid="press-off">No motion action</Button>
          <Loading data-testid="off-spinner" />
          <ConfigProvider data-testid="resumed-scope" theme={{ motion: true }}>
            <Button data-testid="press-resumed">Resumed motion action</Button>
            <Loading data-testid="resumed-spinner" />
          </ConfigProvider>
        </ConfigProvider>
      </ConfigProvider>
    </div>
  );
}
