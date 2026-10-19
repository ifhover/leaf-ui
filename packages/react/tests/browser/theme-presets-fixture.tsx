import {
  Alert,
  AutoComplete,
  Avatar,
  AvatarGroup,
  Button,
  Card,
  Checkbox,
  Collapse,
  ConfigProvider,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  Steps,
  Switch,
  Tabs,
  Tag,
  useMessage,
} from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';
import { type CSSProperties, useState } from 'react';
import { type TestThemeName, testThemes } from '../fixtures/theme-data';

function Feedback() {
  const { message } = useMessage();
  return <Button onClick={() => message.success('Preset saved')}>Show message</Button>;
}

export function ThemePresetsFixture() {
  const [preset, setPreset] = useState<TestThemeName>('illustration');
  const [modal, setModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [primary, setPrimary] = useState('#ff6900');
  const [dark, setDark] = useState(false);
  const params = new URLSearchParams(location.search);
  const custom = params.has('states');
  const global = params.has('global');
  const next = () => setPreset((value) => (value === 'illustration' ? 'cartoon' : 'default'));
  return (
    <ConfigProvider
      className="theme-presets-fixture"
      id="portal-reset-host"
      style={{ '--fixture-primary': primary } as CSSProperties}
      theme={{
        ...(global
          ? {
              primaryColor: params.has('css-primary') ? 'var(--fixture-primary)' : primary,
              appearance: dark ? 'dark' : 'light',
              borderRadius: 4,
              tokens: {
                borderWidth: 2,
                borderColor:
                  'color-mix(in srgb, var(--leaf-color-primary) 12%, var(--leaf-color-text))',
                surfaceColor:
                  'color-mix(in srgb, var(--leaf-color-primary) 2%, light-dark(white, #1c1c20))',
                mutedSurfaceColor:
                  'color-mix(in srgb, var(--leaf-color-primary) 8%, light-dark(white, #1c1c20))',
                controlShadow: '3px 3px 0 var(--leaf-color-border)',
                surfaceShadow: '6px 6px 0 var(--leaf-color-border)',
              },
            }
          : testThemes[preset]),
        motion: false,
        ...(custom
          ? {
              components: {
                Button: {
                  borderWidth: 3,
                  hover: { background: '#ffe599', shadow: '5px 5px 0 #252525' },
                  active: { background: '#f4b183', shadow: '1px 1px 0 #252525' },
                  focus: { borderColor: '#7654c6' },
                  disabled: { background: '#dddddd', shadow: 'none' },
                },
                Input: { focus: { borderColor: '#7654c6', shadow: '0 0 0 3px #7654c630' } },
                AutoComplete: { borderWidth: 3, focus: { borderColor: '#7654c6' } },
                Checkbox: { focus: { borderColor: '#7654c6', shadow: 'none' } },
                Tabs: {
                  hover: { color: '#a31010' },
                  focus: { color: '#7654c6' },
                  active: { color: '#12695f' },
                },
              },
            }
          : {}),
      }}
    >
      <h1>Reusable theme presets</h1>
      {global && (
        <Space direction="vertical">
          <Button onClick={() => setPrimary(primary === '#ff6900' ? '#1d9bf0' : '#ff6900')}>
            Toggle palette
          </Button>
          <Button onClick={() => setDark(!dark)}>Toggle mode</Button>
          <DataTable
            aria-label="Global theme table"
            bordered
            data={[{ id: 'theme', name: 'Shared frame' }]}
            columns={[{ accessorKey: 'name', header: 'Theme' }]}
            rowKey="id"
            pagination={false}
          />
          <AvatarGroup aria-label="Theme collaborators">
            <Avatar>AL</Avatar>
            <Avatar>BO</Avatar>
            <Avatar>CY</Avatar>
          </AvatarGroup>
          <Steps
            aria-label="Theme steps"
            current={1}
            style={{ width: 'min(720px, 85vw)' }}
            items={[{ title: 'An idea' }, { title: 'Bring it to life' }, { title: 'Share' }]}
          />
          <Steps
            aria-label="Vertical theme steps"
            direction="vertical"
            current={1}
            items={[{ title: 'An idea', description: 'Start here' }, { title: 'Create' }]}
          />
          <Collapse items={[{ key: 'one', label: 'Global collapse', children: 'Shared frame' }]} />
          <Pagination aria-label="Global pagination" total={30} />
          <Alert title="Global alert" />
          <Tag color="primary">Global tag</Tag>
          <ConfigProvider theme={{ components: { Input: { borderColor: '#7654c6' } } }}>
            <Input aria-label="Explicit frame override" />
          </ConfigProvider>
        </Space>
      )}
      <Space wrap>
        <Button onClick={next}>Next preset</Button>
        <Button onClick={() => setPreset('illustration')}>Use illustration</Button>
        <Button onClick={() => setPreset('default')}>Use default</Button>
      </Space>
      <Card title="Theme card" style={{ marginBlock: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input aria-label="Theme name" defaultValue="A good idea" />
          <Input aria-label="Invalid theme name" status="error" defaultValue="Check me" />
          <AutoComplete aria-label="Theme suggestion" options={[{ value: 'Sketch' }]} />
          <Select
            aria-label="Theme category"
            defaultValue="design"
            options={[
              { value: 'design', label: 'Design' },
              { value: 'code', label: 'Code' },
            ]}
          />
          <Space wrap>
            <Button>Solid action</Button>
            <Button variant="outline">Outline action</Button>
            <Button variant="soft">Soft action</Button>
            <Button disabled>Disabled action</Button>
          </Space>
          <Space wrap>
            <Checkbox defaultChecked>Theme choice</Checkbox>
            <Switch aria-label="Theme switch" defaultChecked />
            <Button onClick={() => setModal(true)}>Open themed modal</Button>
            <Feedback />
          </Space>
          <Tabs
            type={params.has('line') ? 'line' : 'card'}
            aria-label="Theme views"
            items={[
              { key: 'one', label: 'First' },
              { key: 'two', label: 'Second' },
            ]}
          />
        </Space>
      </Card>
      <ConfigProvider
        theme={testThemes.default}
        getPopupContainer={() => document.getElementById('portal-reset-host') as HTMLElement}
      >
        <Input aria-label="Nested default input" />
        <Input aria-label="Nested invalid input" status="error" />
        <Select
          aria-label="Nested reset select"
          options={[{ value: 'one', label: 'Reset option' }]}
        />
        <Button onClick={() => setResetModal(true)}>Open reset modal</Button>
        <Modal open={resetModal} onClose={() => setResetModal(false)} title="Reset dialog">
          Default theme dialog
        </Modal>
      </ConfigProvider>
      <Modal open={modal} onClose={() => setModal(false)} title="Themed dialog">
        <Button onClick={next}>Change dialog preset</Button>
      </Modal>
    </ConfigProvider>
  );
}
