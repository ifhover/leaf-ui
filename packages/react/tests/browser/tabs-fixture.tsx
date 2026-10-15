import { Button, Input, Space, type TabItem, Tabs } from '@ifhover/leaf-ui';
import { useState } from 'react';

const initial: TabItem[] = [
  { key: 'first', label: 'First', children: <Input aria-label="Retained draft" />, closable: true },
  {
    key: 'second',
    label: 'A longer second tab',
    children: <Input aria-label="Second draft" />,
    closable: true,
  },
  {
    key: 'third',
    label: 'Third',
    closable: true,
    children: (
      <Space direction="vertical" align="stretch">
        <Input aria-label="Third draft" />
        <Input aria-label="More details" />
      </Space>
    ),
  },
];

export function TabsFixture() {
  const params = new URLSearchParams(location.search);
  const size = params.get('size') === 'sm' ? 'sm' : params.get('size') === 'lg' ? 'lg' : 'md';
  const placement = params.get('vertical') ? 'left' : 'top';
  const [items, setItems] = useState(initial);
  return (
    <Space direction="vertical" align="start">
      <Tabs
        data-testid="motion-tabs"
        aria-label="Closable projects"
        type={params.get('line') ? 'line' : 'card'}
        placement={placement}
        size={size}
        items={items}
        style={{
          width: params.has('wide') ? 640 : params.has('narrow') ? 230 : 'max-content',
          maxWidth: '100%',
        }}
        onAdd={() =>
          setItems((current) => [
            ...current,
            { key: 'new', label: 'New', children: 'New content', closable: true },
          ])
        }
        onClose={(key) => setItems((current) => current.filter((item) => item.key !== key))}
      />
      <Button variant="outline" onClick={() => setItems(initial)}>
        Restore tabs
      </Button>
    </Space>
  );
}
