import { Card, ColorPicker, ConfigProvider, DatePicker, Modal, Tabs } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';
import { useState } from 'react';

const initialMutedSurface = 'rgb(244, 243, 239)';
const updatedMutedSurface = 'rgb(218, 228, 220)';
const nestedMutedSurface = 'rgb(46, 58, 70)';
const explicitPaint = 'rgb(201, 73, 41)';

function MutedSurfaceSamples({ name }: { name: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <section
      data-testid={`${name}-muted-samples`}
      aria-label={`${name} muted surface samples`}
      style={{ display: 'grid', gap: 16, maxWidth: 560 }}
    >
      <div data-testid={`${name}-tabs`}>
        <Tabs
          type="segmented"
          aria-label={`${name} views`}
          items={[
            { key: 'one', label: 'First', children: 'First view' },
            { key: 'two', label: 'Second', children: 'Second view' },
          ]}
        />
      </div>
      <Card data-testid={`${name}-card`} title={`${name} inset card`} variant="layered">
        <p>Inset content keeps its inner surface.</p>
      </Card>
      <DataTable
        data-testid={`${name}-table`}
        aria-label={`${name} table`}
        data={[{ id: 'one', name: 'Content surface' }]}
        columns={[{ accessorKey: 'name', header: 'Name' }]}
        rowKey="id"
        pagination={false}
        striped={false}
      />
      <button type="button" onClick={() => setModalOpen(true)}>
        Open {name} modal
      </button>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`${name} modal`}>
        <p>Modal content</p>
      </Modal>
      <DatePicker
        aria-label={`${name} card date`}
        panelVariant="card"
        defaultValue={new Date(2026, 9, 15)}
      />
      <ColorPicker aria-label={`${name} color`} defaultValue="#1265f5" showText />
    </section>
  );
}

export function MutedSurfaceContractFixture() {
  const [mutedSurface, setMutedSurface] = useState(initialMutedSurface);
  const appearance =
    new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light';
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <button
        type="button"
        data-testid="update-muted-surface"
        onClick={() => setMutedSurface(updatedMutedSurface)}
      >
        Update muted surface
      </button>
      <ConfigProvider
        data-testid="muted-outer"
        theme={{
          appearance,
          motion: false,
          tokens: { mutedSurfaceColor: mutedSurface },
        }}
      >
        <MutedSurfaceSamples name="outer" />
        <ConfigProvider
          data-testid="muted-nested"
          theme={{ tokens: { mutedSurfaceColor: nestedMutedSurface } }}
        >
          <MutedSurfaceSamples name="nested" />
        </ConfigProvider>
        <ConfigProvider
          data-testid="explicit-paint"
          theme={{
            components: {
              Card: { background: explicitPaint },
              ColorPicker: { background: explicitPaint },
              DatePicker: { background: explicitPaint },
              Modal: { background: explicitPaint },
              Tabs: { background: explicitPaint },
              Table: { background: explicitPaint },
            },
          }}
        >
          <MutedSurfaceSamples name="explicit" />
        </ConfigProvider>
      </ConfigProvider>
    </div>
  );
}

export { explicitPaint, initialMutedSurface, nestedMutedSurface, updatedMutedSurface };
