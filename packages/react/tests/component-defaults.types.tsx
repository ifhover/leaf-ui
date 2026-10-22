import type { LeafComponentDefaults } from '../src';
import {
  Button,
  DatePicker,
  FormList,
  InputNumber,
  MenuGroup,
  Modal,
  Select,
  Slider,
  TreeSelect,
  VirtualList,
} from '../src';
import type { LeafComponentDefaults as SubpathDefaults } from '../src/config-provider';
import { useComponentProps } from '../src/config-provider/component-defaults';

type PublicExports = typeof import('../src') & typeof import('../src/table');
type PublicComponentName = {
  [Name in keyof PublicExports]: Name extends Capitalize<Name> ? Name : never;
}[keyof PublicExports];
type InfrastructureOrAlias =
  | 'ConfigProvider'
  | 'ConfirmProvider'
  | 'MessageProvider'
  | 'NotificationProvider'
  | 'LoadingBarProvider'
  | 'FAB'
  | 'ResizablePanels';
type MissingDefaults = Exclude<
  PublicComponentName,
  keyof LeafComponentDefaults | InfrastructureOrAlias
>;
type UnknownDefaults = Exclude<keyof LeafComponentDefaults, PublicComponentName | 'Confirm'>;
export const completeComponentDefaultsCoverage: [MissingDefaults, UnknownDefaults] extends [
  never,
  never,
]
  ? true
  : [MissingDefaults, UnknownDefaults] = true;

// Compile-only contracts; required JSX props and mode-specific types stay instance-owned.
export function componentDefaultsTypeContracts() {
  const root: LeafComponentDefaults = {
    Button: { variant: 'outline' },
    Input: { value: '', defaultValue: 'Leaf', onChange: (event) => event.currentTarget.value },
    Select: { showSearch: true, onSearch: (query) => query },
    Modal: { footer: null },
  };
  const subpath: SubpathDefaults = root;
  const reset: LeafComponentDefaults = {
    Button: null,
    Input: null,
    InputSearch: null,
    Select: null,
    Modal: null,
  };
  // @ts-expect-error React refs are not configurable defaults.
  const ref: LeafComponentDefaults = { Input: { ref: () => {} } };
  // @ts-expect-error React keys are not configurable defaults.
  const key: LeafComponentDefaults = { Button: { key: 'global' } };
  // @ts-expect-error Select mode is required on the instance for sound value/callback inference.
  const mode: LeafComponentDefaults = { Select: { multiple: true } };
  // @ts-expect-error Select mode-dependent values stay on the instance.
  const value: LeafComponentDefaults = { Select: { value: 'leaf' } };
  // @ts-expect-error Select mode-dependent initial values stay on the instance.
  const defaultValue: LeafComponentDefaults = { Select: { defaultValue: ['leaf'] } };
  // @ts-expect-error Select mode-dependent callbacks stay on the instance.
  const callback: LeafComponentDefaults = { Select: { onChange: () => {} } };
  // @ts-expect-error Unsupported components are not silently accepted.
  const unsupported: LeafComponentDefaults = { NonexistentComponent: {} };
  // @ts-expect-error Required options belong to the Select instance.
  const options: LeafComponentDefaults = { Select: { options: [] } };
  // @ts-expect-error Required visibility belongs to the Modal instance.
  const open: LeafComponentDefaults = { Modal: { open: true } };
  // @ts-expect-error Provider defaults do not relax required JSX options.
  const missingOptions = <Select />;
  // @ts-expect-error Modal open remains required even if configured elsewhere.
  const missingOpen = <Modal />;
  // @ts-expect-error MenuGroup titles belong to each instance.
  const groupTitle: LeafComponentDefaults = { MenuGroup: { title: 'Global title' } };
  // @ts-expect-error Provider defaults do not relax required group titles.
  const missingGroupTitle = <MenuGroup />;
  // @ts-expect-error Borderless ghost controls are no longer a public Button appearance.
  const removedButtonVariant = <Button variant="ghost" />;
  // @ts-expect-error Regional defaults use the same public Button appearances.
  const removedButtonDefault: LeafComponentDefaults = { Button: { variant: 'ghost' } };
  // @ts-expect-error Soft is no longer a public Button appearance.
  const removedSoftButtonVariant = <Button variant="soft" />;
  // @ts-expect-error Regional defaults use the same public Button appearances.
  const removedSoftButtonDefault: LeafComponentDefaults = { Button: { variant: 'soft' } };
  const multi = <Select multiple options={[]} onChange={(values) => values.map(String)} />;
  const single = <Select options={[]} onChange={(value) => value.toUpperCase()} />;
  return {
    subpath,
    reset,
    ref,
    key,
    mode,
    value,
    defaultValue,
    callback,
    unsupported,
    options,
    open,
    missingOptions,
    missingOpen,
    groupTitle,
    missingGroupTitle,
    removedButtonVariant,
    removedButtonDefault,
    removedSoftButtonVariant,
    removedSoftButtonDefault,
    multi,
    single,
  };
}

export function useComponentPropsTypeContracts() {
  // @ts-expect-error A component name cannot be paired with another component's props.
  const wrongComponent = useComponentProps('Input', { open: true, width: 400 });
  // @ts-expect-error Unknown props must not be inferred as a new arbitrary props type.
  const unknown = useComponentProps('Button', { misspelledVariant: 'invalid' });
  // @ts-expect-error Known props do not allow unrelated extra props either.
  const extra = useComponentProps('Button', { size: 'md', extra: true });
  const multi = useComponentProps('Select', {
    multiple: true,
    options: [],
    onChange: (values) => values.map(String),
  });
  const single = useComponentProps('Select', {
    options: [],
    onChange: (value) => value.toUpperCase(),
  });
  return { wrongComponent, unknown, extra, multi, single };
}

export function expandedComponentDefaultsContracts() {
  const defaults: LeafComponentDefaults = {
    Pagination: { variant: 'outline', showTotal: true },
    Tabs: { size: 'sm' },
    DataTable: { size: 'sm', striped: true },
    DataTableSearch: { allowClear: true },
    VirtualList: { estimateSize: 36 },
    FormList: { className: 'rows' },
    Confirm: { confirmText: 'Continue' },
    Message: { duration: 5 },
    Notification: { placement: 'bottom-right' },
    LoadingBar: { height: 4 },
  };
  // @ts-expect-error Required pagination data stays instance-owned.
  const pagination: LeafComponentDefaults = { Pagination: { total: 100 } };
  // @ts-expect-error Required trigger children stay instance-owned.
  const trigger: LeafComponentDefaults = { Tooltip: { children: <button type="button" /> } };
  // @ts-expect-error Checkable TreeSelect mode determines the value and callback type.
  const checked: LeafComponentDefaults = { TreeSelect: { treeCheckable: true } };
  // @ts-expect-error Numeric/string mode cannot be selected regionally.
  const number: LeafComponentDefaults = { InputNumber: { stringMode: true } };
  // @ts-expect-error Range mode remains visible to the Slider instance's type checker.
  const range: LeafComponentDefaults = { Slider: { range: true } };
  // @ts-expect-error Multiple mode remains visible to DatePicker's type checker.
  const multiple: LeafComponentDefaults = { DatePicker: { multiple: true } };
  const list: LeafComponentDefaults = {
    // @ts-expect-error A generic list's data and callbacks cannot be shared across item types.
    VirtualList: { renderItem: (row: { name: string }) => row.name },
  };
  const estimate: LeafComponentDefaults = {
    // @ts-expect-error Only a type-independent estimate is allowed in global defaults.
    VirtualList: { estimateSize: (row: { height: number }) => row.height },
  };
  // @ts-expect-error FormList's values retain the instance's item type.
  const form: LeafComponentDefaults = { FormList: { defaultValue: ['shared'] } };
  const table: LeafComponentDefaults = {
    // @ts-expect-error Row callbacks remain typed by the DataTable instance.
    DataTable: { getRowLabel: (row: { name: string }) => row.name },
  };
  // @ts-expect-error An imperative scroll ref belongs to one DataTable instance.
  const scrollRef: LeafComponentDefaults = { DataTable: { scrollRef: { current: null } } };
  // @ts-expect-error Native Table composition has been removed from the public API.
  const removedTable: LeafComponentDefaults = { Table: { size: 'sm' } };
  // @ts-expect-error A table element ref cannot be shared through regional defaults.
  const tableRef: LeafComponentDefaults = { DataTable: { tableRef: { current: null } } };
  // @ts-expect-error Task state is owned by the loading bar instance or service.
  const loading: LeafComponentDefaults = { LoadingBar: { active: true } };
  // @ts-expect-error Required notification titles remain request-owned.
  const notification: LeafComponentDefaults = { Notification: { title: 'Shared title' } };
  // @ts-expect-error Service identifiers stay request-owned.
  const message: LeafComponentDefaults = { Message: { key: 'shared' } };
  // @ts-expect-error Context providers configure scopes and are not component defaults targets.
  const provider: LeafComponentDefaults = { ConfigProvider: { components: {} } };
  const decimal = <InputNumber stringMode onChange={(value) => value?.toUpperCase()} />;
  const numeric = <InputNumber onChange={(value) => value?.toFixed()} />;
  const dates = (
    <DatePicker multiple onChange={(values) => values.map((value) => value.getTime())} />
  );
  const slider = <Slider range onChange={(values) => values.map((value) => value.toFixed())} />;
  const tree = <TreeSelect treeCheckable options={[]} onChange={(values) => values.map(String)} />;
  const virtual = (
    <VirtualList
      items={[{ id: 1 }]}
      itemKey={(row) => row.id}
      renderItem={(row) => row.id.toFixed()}
    />
  );
  const rows = (
    <FormList name="rows" defaultValue={[{ name: 'Leaf' }]}>
      {(fields) => fields.map((field) => field.value.name.toUpperCase())}
    </FormList>
  );
  return {
    defaults,
    pagination,
    trigger,
    checked,
    number,
    range,
    multiple,
    list,
    estimate,
    form,
    table,
    scrollRef,
    removedTable,
    tableRef,
    loading,
    notification,
    message,
    provider,
    decimal,
    numeric,
    dates,
    slider,
    tree,
    virtual,
    rows,
  };
}
