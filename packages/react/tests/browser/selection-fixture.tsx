import {
  BottomNavigation,
  Breadcrumb,
  Button,
  CheckableTag,
  ColorPicker,
  ConfigProvider,
  Dropdown,
  Input,
  InputNumber,
  Pagination,
  Select,
  Switch,
  Textarea,
  TimePicker,
  Transfer,
} from '@ifhover/leaf-ui';

export function SelectionFixture() {
  return (
    <ConfigProvider theme={{ primaryColor: '#1265f5', motion: false }}>
      <h1>Selection and focus</h1>
      <div style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
        <Input aria-label="Focused input" />
        <Textarea aria-label="Focused textarea" />
        <InputNumber aria-label="Focused number" />
        <ColorPicker
          aria-label="Accent"
          defaultValue="#1265f5"
          showText
          presets={[{ label: 'Colors', colors: ['#1265f5', '#9b3df0'] }]}
        />
        <Select
          aria-label="Selected person"
          defaultValue="alice"
          options={[
            { value: 'alice', label: 'Alice' },
            { value: 'bob', label: 'Bob' },
            { value: 'disabled', label: 'Disabled', disabled: true },
          ]}
        />
        <TimePicker aria-label="Selected time" defaultValue="09:00" />
        <Dropdown
          items={[
            { key: 'saved', label: 'Saved filter', type: 'checkbox', checked: true },
            { key: 'available', label: 'Available filter', type: 'checkbox' },
            { key: 'disabled', label: 'Disabled filter', disabled: true },
            { key: 'delete', label: 'Delete filter', danger: true },
          ]}
        >
          <Button variant="outline">Checked menu</Button>
        </Dropdown>
        <Pagination total={50} defaultCurrent={2} />
        <Breadcrumb
          items={[
            { title: 'Parent page', href: '#parent' },
            { title: 'Current page', href: '#current' },
          ]}
        />
        <CheckableTag defaultChecked>Design</CheckableTag>
        <BottomNavigation
          aria-label="Sections"
          items={[
            { key: 'home', label: 'Home' },
            { key: 'inbox', label: 'Inbox' },
          ]}
        />
        <Transfer
          items={[
            { key: 'alice', label: 'Transfer Alice' },
            { key: 'bob', label: 'Transfer Bob' },
          ]}
          selectedKeys={['alice']}
          searchable={false}
        />
        <ConfigProvider theme={{ tokens: { onPrimaryColor: '#111111' } }}>
          <Switch aria-label="White thumb" defaultChecked />
        </ConfigProvider>
      </div>
    </ConfigProvider>
  );
}
