import {
  AutoComplete,
  Button,
  Cascader,
  DatePicker,
  DateRangePicker,
  Form,
  FormField,
  Input,
  InputNumber,
  InputSearch,
  Modal,
  Select,
  Space,
  Textarea,
  Transfer,
  TreeSelect,
} from '@ifhover/leaf-ui';
import { useState } from 'react';

const baseline = new Date(2026, 9, 15, 10, 30);
const dialogRows = Array.from({ length: 20 }, (_, index) => `Dialog row ${index + 1}`);

export function PickerSurfacesFixture() {
  const query = new URLSearchParams(location.search);
  const seconds = query.has('seconds');
  const use12Hours = query.has('12h');
  const panelVariant = query.has('plain') ? 'plain' : undefined;
  const [open, setOpen] = useState(false);
  const [plainOpen, setPlainOpen] = useState(false);
  if (query.has('internal-widths')) {
    return (
      <Space direction="vertical" align="start" size={16}>
        <Cascader
          aria-label="Internal cascade"
          options={[{ value: 'leaf', label: 'Leaf' }]}
          showSearch
          popupWidth={400}
        />
        <Transfer
          items={[{ key: 'leaf', label: 'Leaf' }]}
          style={{ width: 800, maxWidth: '100%' }}
        />
      </Space>
    );
  }
  return (
    <div className="picker-surfaces-fixture">
      <h1>Picker and dialog card surfaces</h1>
      <Button onClick={() => setOpen(true)}>Open card dialog</Button>
      <Button onClick={() => setPlainOpen(true)}>Open plain dialog</Button>
      <Modal
        open={open}
        variant="card"
        title="Card dialog"
        description="Content is grouped on an inset surface."
        cancelText="Cancel"
        confirmText="Save"
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      >
        <Space direction="vertical" align="stretch" size={16}>
          {dialogRows.map((row) => (
            <div key={row}>{row}</div>
          ))}
        </Space>
      </Modal>
      <Modal
        open={plainOpen}
        title="Plain dialog"
        description="The default dialog shares the muted canvas."
        cancelText="Cancel"
        confirmText="Save"
        onClose={() => setPlainOpen(false)}
        onConfirm={() => setPlainOpen(false)}
      >
        <div>Plain dialog content</div>
      </Modal>
      <Space direction="vertical" align="stretch" size={16} style={{ marginBlockStart: 24 }}>
        <DatePicker
          aria-label="Card date"
          panelVariant={panelVariant}
          defaultValue={baseline}
          showToday
        />
        <DatePicker
          picker="datetime"
          aria-label="Card date time"
          showSeconds={seconds}
          use12Hours={use12Hours}
          panelVariant={panelVariant}
          defaultValue={baseline}
        />
        <DateRangePicker
          aria-label="Card date range"
          panelVariant={panelVariant}
          defaultValue={[baseline, new Date(2026, 9, 20, 18, 30)]}
        />
        <DateRangePicker
          aria-label="Card date time range"
          picker="datetime"
          panelVariant={panelVariant}
          showSeconds={seconds}
          use12Hours={use12Hours}
          allowEmpty={[true, true]}
          defaultValue={[baseline, new Date(2026, 9, 20, 18, 30)]}
        />
        <DatePicker
          picker="time"
          aria-label="Card time"
          showSeconds={seconds}
          use12Hours={use12Hours}
          panelVariant={panelVariant}
          defaultValue="10:30"
        />
        <DateRangePicker
          picker="time"
          aria-label="Card time range"
          panelVariant={panelVariant}
          showSeconds={seconds}
          use12Hours={use12Hours}
          defaultValue={['09:00', '18:00']}
        />
      </Space>
      {query.has('refinements') && (
        <Space direction="vertical" align="start" size={12}>
          <Input aria-label="Width input" />
          <InputNumber aria-label="Width number" />
          <InputSearch aria-label="Width search" enterButton="Search" />
          <Select
            aria-label="Width select"
            options={[
              {
                value: 'long',
                label: 'A much longer selected option that must not resize the field',
              },
            ]}
          />
          <Cascader
            aria-label="Width cascader"
            options={[{ value: 'long', label: 'A much longer cascading selection' }]}
          />
          <TreeSelect
            aria-label="Width tree"
            options={[{ value: 'long', label: 'A much longer tree selection' }]}
          />
          <AutoComplete aria-label="Width autocomplete" options={[]} />
          <Input aria-label="Explicit width" style={{ width: 320 }} />
          <div style={{ width: 180 }}>
            <Input aria-label="Narrow container" />
          </div>
          <div style={{ width: 320 }}>
            <Form layout="vertical">
              <FormField label="Form input">
                <Input />
              </FormField>
              <FormField label="Form number">
                <InputNumber />
              </FormField>
              <FormField label="Form tree">
                <TreeSelect options={[]} />
              </FormField>
              <FormField label="Form range">
                <DateRangePicker picker="datetime" />
              </FormField>
              <FormField label="Form extended range">
                <DateRangePicker picker="datetime" showSeconds use12Hours />
              </FormField>
            </Form>
            <Textarea aria-label="Full textarea" />
          </div>
          <DatePicker aria-label="Week hover" picker="week" defaultValue={new Date(2026, 9, 5)} />
          <DatePicker aria-label="Month gaps" picker="month" defaultValue={baseline} />
          <DatePicker aria-label="Quarter gaps" picker="quarter" defaultValue={baseline} />
          <DatePicker aria-label="Year gaps" picker="year" defaultValue={baseline} />
        </Space>
      )}
    </div>
  );
}
