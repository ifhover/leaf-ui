import {
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  CommandPalette,
  ConfigProvider,
  DatePicker,
  Form,
  FormField,
  Input,
  InputNumber,
  InputSearch,
  type LeafComponentDefaults,
  LoadingBarProvider,
  Modal,
  Pagination,
  Select,
  Space,
  SplitButton,
  Tabs,
  Tag,
  Transfer,
  Upload,
  useConfirm,
  useLoadingBar,
  useMessage,
  useNotification,
} from '@ifhover/leaf-ui';
import { useMemo, useRef, useState } from 'react';

const options = [
  { value: 'leaf', label: 'Leaf' },
  { value: 'react', label: 'React' },
];
const inner: LeafComponentDefaults = { Button: { size: 'lg' } };
const boundaryDefaults = {
  Button: { loading: true, disabled: true, type: 'submit', size: 'sm', variant: 'outline' },
  Input: { type: 'password', readOnly: true, required: true, value: 'Shared', id: 'global-field' },
  Select: { readOnly: true, showSearch: true, loading: true },
} satisfies LeafComponentDefaults;

function ComponentDefaultsBoundaries() {
  const [submits, setSubmits] = useState(0);
  const [copied, setCopied] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [commandsOpen, setCommandsOpen] = useState(false);
  return (
    <section aria-label="Component boundaries">
      <h2>Component boundaries</h2>
      <ConfigProvider components={boundaryDefaults}>
        <Space direction="vertical" align="stretch">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmits((value) => value + 1);
            }}
          >
            <Space direction="vertical" align="start">
              <SplitButton
                loading={false}
                disabled={false}
                menuLabel="Split menu"
                items={[{ key: 'copy', label: 'Copy item', onClick: () => setCopied(true) }]}
              >
                Split primary
              </SplitButton>
              <Upload>Choose boundary file</Upload>
              <Pagination total={100} showSizeChanger onChange={(_, size) => setPageSize(size)} />
            </Space>
          </form>
          <Space>
            <output aria-label="Boundary submissions">{submits}</output>
            <output aria-label="Copied item">{String(copied)}</output>
            <output aria-label="Boundary page size">{pageSize}</output>
          </Space>
          <ConfigProvider components={{ Input: null, Button: null }}>
            <form aria-label="Cleared defaults">
              <Space direction="vertical" align="stretch">
                <Input aria-label="Local reset input" name="local" defaultValue="Editable" />
                <Button type="reset">Reset local input</Button>
              </Space>
            </form>
          </ConfigProvider>
          <Button
            type="button"
            loading={false}
            disabled={false}
            onClick={() => setCommandsOpen(true)}
          >
            Open boundary commands
          </Button>
        </Space>
        <CommandPalette
          open={commandsOpen}
          onOpenChange={setCommandsOpen}
          shortcut={false}
          items={[
            { key: 'copy', label: 'Copy command' },
            { key: 'save', label: 'Save command' },
          ]}
        />
      </ConfigProvider>
    </section>
  );
}

function ConfirmRequest() {
  const { confirm } = useConfirm();
  return (
    <Button onClick={() => void confirm({ title: 'Delete item', children: 'Cannot undo.' })}>
      Confirm request
    </Button>
  );
}

function ScopedServiceActions() {
  const { confirm } = useConfirm();
  const { message } = useMessage();
  const notification = useNotification();
  const loading = useLoadingBar();
  const finish = useRef<(() => void) | undefined>(undefined);
  return (
    <Space wrap>
      <Button
        onClick={() =>
          void confirm({ title: 'Regional confirm', children: <Tag>Confirm content</Tag> })
        }
      >
        Regional confirm request
      </Button>
      <Button onClick={() => message.open({ content: <Tag>Message content</Tag> })}>
        Regional message
      </Button>
      <Button
        onClick={() =>
          notification.open({ title: 'Regional notice', description: <Tag>Notice content</Tag> })
        }
      >
        Regional notification
      </Button>
      <Button
        onClick={() => {
          finish.current = loading.start();
        }}
      >
        Start scoped task
      </Button>
      <Button onClick={() => finish.current?.()}>Finish scoped task</Button>
    </Space>
  );
}

function ExpandedComponentDefaults() {
  const [updated, setUpdated] = useState(false);
  const components = useMemo<LeafComponentDefaults>(
    () => ({
      Form: { layout: 'vertical' },
      Checkbox: { defaultChecked: true, name: 'independent' },
      CheckboxGroup: { size: 'sm', defaultValue: ['a'] },
      InputNumber: { size: updated ? 'lg' : 'sm', defaultValue: updated ? 7 : 2 },
      DatePicker: { size: 'sm', allowClear: true, popupClassName: 'regional-date-panel' },
      Card: { size: 'sm' },
      Tabs: { size: 'lg', closable: true },
      Tag: { variant: updated ? 'soft' : 'outline', color: 'success' },
      Confirm: { confirmText: updated ? 'Proceed now' : 'Proceed', cancelText: 'Back' },
      Message: { duration: 30, type: 'warning', closable: true },
      Notification: { duration: 30, placement: 'bottom-left' },
      LoadingBar: { height: updated ? 7 : 5, color: updated ? '#cf0b2d' : '#1d9bf0' },
      VirtualList: { horizontal: true, className: 'public-list-default' },
      Transfer: { height: 160 },
    }),
    [updated],
  );
  return (
    <section aria-label="Expanded defaults">
      <h2>Expanded defaults</h2>
      <Button onClick={() => setUpdated((value) => !value)}>Change expanded defaults</Button>
      <ConfigProvider components={components}>
        <Space direction="vertical" align="stretch">
          <Form aria-label="Expanded form">
            <FormField label="Amount">
              <InputNumber name="amount" />
            </FormField>
            <FormField label="Event date">
              <DatePicker name="date" />
            </FormField>
            <Checkbox>Independent choice</Checkbox>
            <CheckboxGroup
              name="group"
              options={[
                { value: 'a', label: 'Group A' },
                { value: 'b', label: 'Group B' },
              ]}
            />
          </Form>
          <Card
            aria-label="Embedded tabs card"
            tabs={{
              'aria-label': 'Embedded tabs',
              items: [{ key: 'one', label: 'Embedded one', children: 'Card content' }],
            }}
          />
          <Tabs
            data-testid="public-default-tabs"
            aria-label="Public tabs"
            items={[{ key: 'one', label: 'Public one', children: 'Public content' }]}
          />
          <ScopedServiceActions />
          <Transfer
            aria-label="Scoped transfer"
            virtual
            items={[{ key: 'a', label: 'Transfer row' }]}
          />
          <div
            data-testid="provider-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <LoadingBarProvider>
              <Button>Grid first</Button>
              <Button>Grid second</Button>
            </LoadingBarProvider>
          </div>
        </Space>
      </ConfigProvider>
    </section>
  );
}

export function ComponentDefaultsFixture() {
  const [large, setLarge] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const components = useMemo<LeafComponentDefaults>(
    () => ({
      Button: { variant: 'outline', size: large ? 'lg' : 'sm' },
      Input: {
        allowClear: true,
        size: large ? 'lg' : 'sm',
        defaultValue: large ? 'Updated' : 'Leaf',
      },
      InputSearch: { enterButton: 'Find', onSearch: setQuery },
      Select: { showSearch: true, allowClear: true, size: 'sm', popupClassName: 'defaults-popup' },
      Modal: {
        width: 520,
        confirmText: 'Save',
        maskClosable: false,
        description: 'Modal defaults only',
      },
    }),
    [large],
  );
  return (
    <div className="component-defaults-fixture">
      <h1>Component defaults</h1>
      <Space>
        <Button onClick={() => setLarge((value) => !value)}>Update defaults</Button>
        <Button>Outside defaults</Button>
      </Space>
      <ConfigProvider components={components}>
        <Space direction="vertical" align="stretch" size="lg">
          <Space>
            <Button>Inherited</Button>
            <Button variant="solid" size="md">
              Instance override
            </Button>
          </Space>
          <ConfigProvider components={inner}>
            <Button>Nested override</Button>
          </ConfigProvider>
          <form aria-label="Defaults form">
            <Space direction="vertical" align="stretch">
              <Input name="name" aria-label="Name" />
              <InputSearch name="search" aria-label="Search" />
              <Button type="reset">Reset inputs</Button>
            </Space>
          </form>
          <Select
            multiple
            aria-label="Libraries"
            options={options}
            value={selected}
            onChange={setSelected}
          />
          <output aria-label="Search result">{query || 'None'}</output>
          <output aria-label="Selected libraries">{selected.join(',') || 'None'}</output>
          <Form disabled>
            <FormField label="Disabled search">
              <InputSearch disabled={false} enterButton="Disabled find" />
            </FormField>
          </Form>
          <Space>
            <Button onClick={() => setOpen(true)}>Open defaults modal</Button>
            <ConfirmRequest />
          </Space>
        </Space>
        <Modal open={open} title="Default modal" onClose={() => setOpen(false)}>
          <Space direction="vertical" align="stretch">
            <Input aria-label="Modal name" />
            <Select aria-label="Modal library" options={options} />
            <Button>Portal button</Button>
          </Space>
        </Modal>
      </ConfigProvider>
      <ComponentDefaultsBoundaries />
      <ExpandedComponentDefaults />
    </div>
  );
}
