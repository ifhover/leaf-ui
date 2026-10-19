import { Button, Card, CardTitle, ConfigProvider, Input, type TabItem } from '@ifhover/leaf-ui';
import { useState } from 'react';

function CardTitlesFixture() {
  const dark = new URLSearchParams(location.search).get('theme') === 'dark';
  const longTitle = `Long project title ${'UnbrokenProjectIdentifier'.repeat(12)}`;
  return (
    <section data-testid="card-titles" style={{ display: 'grid', gap: 16, maxWidth: 320 }}>
      <h1>Reusable card titles</h1>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} data-testid={`title-pair-${size}`}>
          <CardTitle data-testid="standalone-title" size={size}>
            Standalone {size}
          </CardTitle>
          <Card title={`Card ${size}`} size={size} />
        </div>
      ))}
      <CardTitle data-testid="semantic-title" level={2} size="sm" title="Native heading hint">
        Small section heading
      </CardTitle>
      <ConfigProvider components={{ CardTitle: { size: 'lg', level: 4 } }} style={{ minHeight: 0 }}>
        <CardTitle data-testid="regional-title">Regional standalone title</CardTitle>
        <Card data-testid="regional-card" title="Isolated card title" size="sm" />
      </ConfigProvider>
      <ConfigProvider
        data-testid="custom-title-theme"
        style={{ minHeight: 0 }}
        theme={{
          fontSize: 18,
          fontFamily: 'monospace',
          headingWeight: 700,
          tokens: { textColor: dark ? '#d7e7ff' : '#123456' },
        }}
      >
        <CardTitle data-testid="custom-title">Custom standalone title</CardTitle>
        <Card data-testid="custom-card" title="Custom card title" />
        <ConfigProvider theme={{ headingWeight: 400 }} style={{ minHeight: 0 }}>
          <CardTitle data-testid="local-title">Local standalone title</CardTitle>
          <Card data-testid="local-card" title="Local card title" />
        </ConfigProvider>
      </ConfigProvider>
      <div data-testid="long-title-container">
        <CardTitle data-testid="long-standalone-title">{longTitle}</CardTitle>
        <Card data-testid="long-title-card" title={longTitle} extra="Action" />
      </div>
    </section>
  );
}

export function CardTabsFixture() {
  const params = new URLSearchParams(location.search);
  const size = params.has('large') ? 'lg' : params.has('small') ? 'sm' : 'md';
  const [title, setTitle] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('details');
  const [sortedItems, setSortedItems] = useState<TabItem[]>([
    { key: 'first', label: 'First', children: 'Original first content' },
    { key: 'second', label: 'Second', children: 'Original second content' },
  ]);
  const [items, setItems] = useState<TabItem[]>(
    Array.from({ length: 9 }, (_, index) => ({
      key: `draft-${index}`,
      label: `Draft ${index + 1}`,
      children: `Draft ${index + 1} content`,
      closable: true,
    })),
  );
  if (params.has('titles')) return <CardTitlesFixture />;
  return (
    <ConfigProvider
      theme={
        params.has('overrides')
          ? {
              primaryColor: '#7c3aed',
              borderRadius: 5,
              components: {
                Card: { padding: '12px 24px', headerBackground: '#292935', borderColor: '#888899' },
              },
            }
          : { primaryColor: params.get('theme') === 'dark' ? '#76aaff' : '#1669dc' }
      }
    >
      <h1>Card tabs</h1>
      <h2>Integrated navigation</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <Button onClick={() => setTitle((title) => !title)}>Toggle heading</Button>
        <Button onClick={() => setLoading((loading) => !loading)}>Toggle loading</Button>
      </div>
      <div style={{ display: 'grid', gap: 24, maxWidth: 520 }}>
        <Card
          data-testid="titled-card"
          title={title ? 'Project settings' : undefined}
          description={title ? 'Manage project details and members.' : undefined}
          extra={<Button variant="link">Manage project</Button>}
          divided
          loading={loading}
          size={size}
          tabs={{
            'aria-label': 'Project pages',
            size: params.has('tabs-small') ? 'sm' : undefined,
            activeKey,
            onChange: setActiveKey,
            extra: <Button variant="link">Help</Button>,
            items: [
              {
                key: 'details',
                label: 'Details',
                children: <Input aria-label="Card draft" placeholder="Write a draft" />,
              },
              { key: 'disabled', label: 'Billing', disabled: true, children: null },
              { key: 'members', label: 'Members', children: <p>Project members</p> },
            ],
          }}
          footer={<Button variant="outline">Save settings</Button>}
        />
        <Card
          data-testid="untitled-card"
          size={size}
          extra={<Button variant="link">View project</Button>}
          tabs={{
            'aria-label': 'Overview pages',
            items: [
              { key: 'summary', label: 'Summary', children: 'Project overview' },
              { key: 'activity', label: 'Activity', children: 'Recent activity' },
            ],
          }}
        />
        <Card
          data-testid="overflow-card"
          title={title ? 'Drafts' : undefined}
          style={{ maxWidth: 320 }}
          tabs={{
            'aria-label': 'Draft pages',
            items,
            onClose: (key) => setItems((items) => items.filter((item) => item.key !== key)),
            onAdd: () =>
              setItems([...items, { key: 'new', label: 'New draft', children: 'New draft' }]),
          }}
        >
          Shared note
        </Card>
        <Card
          data-testid="sortable-card"
          title="Ordered pages"
          loading={loading}
          tabs={{ items: sortedItems, sortable: true, onReorder: setSortedItems }}
        />
      </div>
    </ConfigProvider>
  );
}
