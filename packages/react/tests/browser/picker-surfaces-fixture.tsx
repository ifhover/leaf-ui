import {
  Button,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  Modal,
  Space,
  TimePicker,
  TimeRangePicker,
} from '@ifhover/leaf-ui';
import { useState } from 'react';

const baseline = new Date(2026, 9, 15, 10, 30);
const dialogRows = Array.from({ length: 20 }, (_, index) => `Dialog row ${index + 1}`);

export function PickerSurfacesFixture() {
  const [open, setOpen] = useState(false);
  const [plainOpen, setPlainOpen] = useState(false);
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
        <DatePicker aria-label="Card date" panelVariant="card" defaultValue={baseline} showToday />
        <DateTimePicker aria-label="Card date time" panelVariant="card" defaultValue={baseline} />
        <DateRangePicker
          aria-label="Card date range"
          panelVariant="card"
          defaultValue={[baseline, new Date(2026, 9, 20, 18, 30)]}
        />
        <TimePicker aria-label="Card time" panelVariant="card" defaultValue="10:30" />
        <TimeRangePicker
          aria-label="Card time range"
          panelVariant="card"
          defaultValue={['09:00', '18:00']}
        />
      </Space>
    </div>
  );
}
