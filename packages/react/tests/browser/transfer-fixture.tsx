import { Card, ConfigProvider, Transfer } from '@ifhover/leaf-ui';

const items = [
  { key: 'alice', label: 'Alice', description: 'Engineering' },
  { key: 'bob', label: 'Bob', description: 'Design' },
  { key: 'carol', label: 'Carol', disabled: true },
  ...Array.from({ length: 30 }, (_, index) => ({
    key: `member-${index}`,
    label: `Member ${index + 1}`,
  })),
];

export function TransferFixture() {
  const params = new URLSearchParams(location.search);
  const custom = params.has('custom');
  return (
    <ConfigProvider
      theme={
        custom || params.has('muted')
          ? {
              tokens: { mutedSurfaceColor: 'rgb(244, 243, 239)' },
              components: custom
                ? {
                    Transfer: {
                      background: 'rgb(240, 245, 242)',
                      headerBackground: 'rgb(230, 235, 232)',
                      borderRadius: 3,
                      borderColor: 'rgb(100, 110, 105)',
                      shadow: 'none',
                    },
                  }
                : undefined,
            }
          : undefined
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 24,
          justifyItems: 'start',
          width: '100%',
          minWidth: 0,
        }}
      >
        <h1>Transfer surfaces</h1>
        <Card
          title="Layered surface reference"
          variant="layered"
          style={{ width: 404, maxWidth: '100%' }}
        >
          The same muted canvas and inset content surface.
        </Card>
        <Transfer
          data-testid="transfer"
          items={items}
          defaultValue={['bob']}
          virtual={params.has('virtual')}
          searchable={!params.has('no-search')}
          disabled={params.has('disabled')}
        />
      </div>
    </ConfigProvider>
  );
}
