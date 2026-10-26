import {
  Anchor,
  Button,
  Collapse,
  ConfigProvider,
  DatePicker,
  Descriptions,
  Drawer,
  FileList,
  Form,
  FormField,
  Input,
  InputOTP,
  Popconfirm,
  Tabs,
  Tag,
  Transfer,
  Upload,
} from '@ifhover/leaf-ui';
import { useState } from 'react';

export function WorkbenchReviewFixture() {
  const [drawer, setDrawer] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 720 }}>
      <Button onClick={() => setDrawer(true)}>Review drawer</Button>
      <Drawer
        open={drawer}
        width={330}
        title="Preferences"
        onClose={() => setDrawer(false)}
        footer={<Button variant="solid">Save</Button>}
      >
        <Form>
          <FormField label="A very long preference label that must never squeeze the field">
            <Input aria-label="Preference value" />
          </FormField>
        </Form>
      </Drawer>
      <Popconfirm title="Confirm review?" onConfirm={() => setConfirmed(true)}>
        <Button>Review confirm</Button>
      </Popconfirm>
      <output>{confirmed ? 'Confirmed' : ''}</output>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Collapse
          key={size}
          size={size}
          data-testid={`collapse-${size}`}
          items={[{ key: 'one', label: 'Collapse heading', children: 'Expanded content' }]}
        />
      ))}
      <DatePicker
        picker="quarter"
        defaultValue={new Date(2026, 0, 1)}
        aria-label="Review quarter"
      />
      <Tag closable>Close target</Tag>
      <Tabs
        items={[
          { key: 'one', label: 'First tab', closable: true },
          { key: 'two', label: 'Second tab' },
        ]}
        onClose={() => {}}
      />
      <div style={{ width: 320, maxWidth: '100%' }} data-testid="narrow-transfer">
        <Transfer
          searchable
          items={[
            {
              key: 'one',
              label: 'A long transfer item that should remain readable on narrow screens',
            },
            { key: 'two', label: 'Second item' },
          ]}
        />
      </div>
      <ConfigProvider
        theme={{
          components: {
            Transfer: { borderRadius: 3, background: '#f0f5f2' },
            Descriptions: { borderRadius: 3, background: '#f0f5f2' },
            FileList: { borderRadius: 3, background: '#f0f5f2' },
            InputOTP: { borderRadius: 3, background: '#f0f5f2' },
          },
        }}
      >
        <section data-testid="component-themes" style={{ display: 'grid', gap: 12, minWidth: 0 }}>
          <Transfer items={[{ key: 'one', label: 'One' }]} />
          <Descriptions bordered items={[{ key: 'one', label: 'Name', children: 'Leaf' }]} />
          <FileList items={[{ name: 'Review.txt', uid: 'one' }]} />
          <InputOTP aria-label="Review code" defaultValue="12" />
        </section>
      </ConfigProvider>
      <Upload drag />
      <Anchor items={[{ key: 'destination', title: 'Destination', href: '#review-destination' }]} />
      <h2 id="review-destination">Anchor destination</h2>
    </div>
  );
}
