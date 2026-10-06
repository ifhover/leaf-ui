import {
  Button,
  ConfigProvider,
  FileList,
  FloatButtonGroup,
  Input,
  List,
  Loading,
  Modal,
  Segmented,
  Select,
  Tabs,
  TimeRangePicker,
} from '@sudden3/leaf-ui';
import { useRef, useState } from 'react';

export function MotionFixture() {
  const [enabled, setEnabled] = useState(true);
  const [tab, setTab] = useState('a');
  const [segment, setSegment] = useState('one');
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
        <Button onClick={() => setRows((items) => [...items].reverse())}>Reverse</Button>
        <Button onClick={() => setRows((items) => [...items.slice(1), ...items.slice(0, 1)])}>
          Rotate
        </Button>
        <List
          aria-label="Animated rows"
          items={rows}
          itemKey={(item) => item}
          renderItem={(item) => <div style={{ height: 48 }}>{item}</div>}
        />
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
        <Segmented
          aria-label="Animated segmented"
          value={segment}
          onChange={setSegment}
          options={['one', 'two', 'three']}
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
          footer={<Button onClick={() => setStep(!step)}>Change modal step</Button>}
        >
          <div style={{ minHeight: step ? 210 : tall ? 800 : 40 }}>
            <Input ref={name} aria-label="Retained modal name" />
            <p>{step ? 'Details for the next step' : 'First step'}</p>
          </div>
        </Modal>
        <Loading data-testid="main-spinner" />
        <ConfigProvider data-testid="off-scope" theme={{ motion: false }}>
          <Loading data-testid="off-spinner" />
          <ConfigProvider data-testid="resumed-scope" theme={{ motion: true }}>
            <Loading data-testid="resumed-spinner" />
          </ConfigProvider>
        </ConfigProvider>
      </ConfigProvider>
    </div>
  );
}
