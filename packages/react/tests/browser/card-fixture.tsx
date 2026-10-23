import {
  Button,
  Card,
  CardTitle,
  ConfigProvider,
  Input,
  type TabItem,
  Tag,
} from '@ifhover/leaf-ui';
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
      <CardTitle
        data-testid="rich-title"
        description="Supporting details stay beneath the heading."
        extra={<Button variant="link">Manage</Button>}
      >
        Project overview
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
        <CardTitle data-testid="custom-title" size="lg">
          Custom standalone title
        </CardTitle>
        <Card data-testid="custom-card" title="Custom card title" size="lg" />
        <ConfigProvider theme={{ headingWeight: 400 }} style={{ minHeight: 0 }}>
          <CardTitle data-testid="local-title" size="lg">
            Local standalone title
          </CardTitle>
          <Card data-testid="local-card" title="Local card title" size="lg" />
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
  const [selected, setSelected] = useState(params.has('selected'));
  const [primaryColor, setPrimaryColor] = useState(
    params.get('theme') === 'dark' ? '#76aaff' : '#1669dc',
  );
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
          : { primaryColor }
      }
    >
      <h1>Card tabs</h1>
      <h2>Integrated navigation</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <Button onClick={() => setTitle((title) => !title)}>Toggle heading</Button>
        <Button onClick={() => setLoading((loading) => !loading)}>Toggle loading</Button>
        <Button onClick={() => setSelected((selected) => !selected)}>Toggle selected</Button>
        <Button onClick={() => setPrimaryColor('#b74913')}>Change primary</Button>
      </div>
      <div style={{ display: 'grid', gap: 24, maxWidth: 520 }}>
        <Card
          data-testid="titled-card"
          selected={selected}
          title={title ? 'Project settings' : undefined}
          description={title ? 'Manage project details and members.' : undefined}
          extra={<Button variant="link">Manage project</Button>}
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
        <Card
          data-testid="layered-card"
          selected={selected}
          title="Visit at risk"
          description="The next visit starts later than the scheduled arrival."
          extra={
            <Tag variant="outline" color="warning">
              17 min late
            </Tag>
          }
          footer={<Button variant="outline">Review visit</Button>}
          variant="layered"
          size={size}
        >
          The assigned caregiver has not started travel. Traffic places the arrival at 2:17 PM.
        </Card>
        <Card data-testid="unbordered-card" bordered={false} selected={selected}>
          Borderless until selected
        </Card>
        <Card
          data-testid="layered-tabbed-card"
          title="Visit notes"
          variant="layered"
          size={size}
          tabs={{
            items: [
              { key: 'summary', label: 'Summary', children: 'Latest visit summary' },
              { key: 'history', label: 'History', children: 'Previous visits' },
            ],
          }}
        />
      </div>
    </ConfigProvider>
  );
}
