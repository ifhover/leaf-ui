import {
  Alert,
  Button,
  Cascader,
  ConfigProvider,
  Dropdown,
  Progress,
  Select,
  Space,
  Tree,
  TreeSelect,
} from '@ifhover/leaf-ui';

const people = [
  { value: 'alice', label: 'Alice' },
  { value: 'bob', label: 'Bob' },
  { value: 'charlie', label: 'Charlie' },
  { value: 'disabled', label: 'Unavailable', disabled: true },
];
export function RefinementsFixture() {
  const params = new URLSearchParams(location.search);
  return (
    <ConfigProvider theme={{ motion: !params.has('no-motion') }}>
      <h1>Refined feedback and popups</h1>
      <Space direction="vertical" align="stretch" size={24} style={{ maxWidth: 800 }}>
        <Select aria-label="Animated select" options={people} defaultValue="alice" />
        <TreeSelect aria-label="Animated tree select" options={people} defaultValue="alice" />
        <TreeSelect aria-label="Empty tree select" options={people} />
        <Tree
          aria-label="Animated tree"
          data={people.map(({ value, label }) => ({
            key: value,
            title: label,
          }))}
          defaultSelectedKeys={['alice']}
        />
        <Select
          aria-label="Custom option height select"
          optionHeight={48}
          options={people}
          defaultValue="alice"
        />
        <Select
          aria-label="Long option select"
          style={{ width: 280 }}
          options={[
            { value: 'first', label: 'First compact option' },
            { value: 'second', label: 'Second compact option' },
            {
              value: 'long',
              label:
                'A deliberately long option label that must wrap onto another line without being clipped by the row height, and this additional sentence ensures the row needs more than one line at the narrow test width',
            },
          ]}
        />
        <Cascader
          aria-label="Animated cascader"
          options={[
            {
              value: 'design',
              label: 'Design',
              children: [
                { value: 'ux', label: 'UX' },
                { value: 'ui', label: 'UI' },
              ],
            },
            {
              value: 'engineering',
              label: 'Engineering',
              children: Array.from({ length: 18 }, (_, i) => ({
                value: `team-${i}`,
                label: `Team ${i + 1}`,
              })),
            },
          ]}
        />
        <Dropdown
          items={[
            { key: 'open', label: 'Open' },
            { key: 'edit', label: 'Edit' },
            { key: 'delete', label: 'Delete', danger: true },
          ]}
        >
          <Button variant="outline">Animated menu</Button>
        </Dropdown>
        <Dropdown
          items={[
            { key: 'open', label: 'Open', extra: <span>Ctrl O</span> },
            {
              key: 'more',
              label: 'More',
              extra: <span>Ctrl M</span>,
              children: [{ key: 'archive', label: 'Archive' }],
            },
            {
              key: 'status',
              label: 'Status',
              extra: <span>Awaiting a long-running export to finish</span>,
            },
          ]}
        >
          <Button variant="outline">Trailing menu</Button>
        </Dropdown>
        <Dropdown popupWidth={160} items={[{ key: 'compact', label: 'Compact menu' }]}>
          <Button variant="outline">Narrow menu</Button>
        </Dropdown>
        <Alert title="One-line notice" />
        <Alert
          title="Detailed notice"
          description="A supporting description remains below the title."
        />
        <Progress aria-label="In progress" percent={48} />
        <Progress aria-label="Static progress" percent={48} active={false} />
        <Progress aria-label="Completed" percent={100} />
        <Progress aria-label="Failed" percent={35} status="error" />
      </Space>
    </ConfigProvider>
  );
}
