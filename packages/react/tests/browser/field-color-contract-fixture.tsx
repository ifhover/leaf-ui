import {
  AutoComplete,
  Cascader,
  ColorPicker,
  ConfigProvider,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Textarea,
  TreeSelect,
} from '@ifhover/leaf-ui';

const options = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
];
const cascaderOptions = [
  {
    value: 'design',
    label: 'Design',
    children: [{ value: 'tokens', label: 'Tokens' }],
  },
];
const treeOptions = [
  {
    value: 'studio',
    label: 'Studio',
    children: [{ value: 'design', label: 'Design' }],
  },
];

const familyKinds = [
  'auto-complete',
  'input-number',
  'cascader',
  'tree-select',
  'color-picker',
  'date-picker',
] as const;
type FamilyKind = (typeof familyKinds)[number];
type FieldState = 'default' | 'error' | 'warning' | 'disabled';
const familyLabels: Record<FamilyKind, string> = {
  'auto-complete': 'AutoComplete',
  'input-number': 'InputNumber',
  cascader: 'Cascader',
  'tree-select': 'TreeSelect',
  'color-picker': 'ColorPicker',
  'date-picker': 'DatePicker',
};

const fieldGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
} as const;

const sectionStyle = {
  display: 'grid',
  gap: 12,
} as const;

function FamilyControl({
  kind,
  label,
  state,
}: {
  kind: FamilyKind;
  label: string;
  state: FieldState;
}) {
  const status = state === 'error' || state === 'warning' ? state : undefined;
  const disabled = state === 'disabled';
  const props = { 'aria-label': label, status, disabled };
  switch (kind) {
    case 'auto-complete':
      return <AutoComplete {...props} options={options} />;
    case 'input-number':
      return <InputNumber {...props} />;
    case 'cascader':
      return <Cascader {...props} options={cascaderOptions} />;
    case 'tree-select':
      return <TreeSelect {...props} options={treeOptions} />;
    case 'color-picker':
      return <ColorPicker {...props} showText />;
    case 'date-picker':
      return <DatePicker {...props} />;
  }
}

function FamilyField({
  field,
  kind,
  state = 'default',
}: {
  field: string;
  kind: FamilyKind;
  state?: FieldState;
}) {
  return (
    <div data-field={field}>
      <FamilyControl kind={kind} label={`${field} ${familyLabels[kind]}`} state={state} />
    </div>
  );
}

function FamilyFields({
  prefix,
  state = 'default',
  kinds = familyKinds,
}: {
  prefix: string;
  state?: FieldState;
  kinds?: readonly FamilyKind[];
}) {
  return (
    <div style={fieldGrid}>
      {kinds.map((kind) => (
        <FamilyField key={kind} field={`${prefix}-${kind}`} kind={kind} state={state} />
      ))}
    </div>
  );
}

function DefaultFields() {
  return (
    <section aria-label="Default fields" data-field-section="default" style={sectionStyle}>
      <h2>Default field recipe</h2>
      <div style={fieldGrid}>
        <div data-field="default-input">
          <Input aria-label="Default input" />
        </div>
        <div data-field="default-select">
          <Select aria-label="Default select" options={options} />
        </div>
        <div data-field="error-input">
          <Input aria-label="Error input" status="error" />
        </div>
        <div data-field="error-select">
          <Select aria-label="Error select" options={options} status="error" />
        </div>
        <div data-field="warning-input">
          <Input aria-label="Warning input" status="warning" />
        </div>
        <div data-field="warning-select">
          <Select aria-label="Warning select" options={options} status="warning" />
        </div>
        <div data-field="disabled-input">
          <Input aria-label="Disabled input" disabled />
        </div>
        <div data-field="disabled-select">
          <Select aria-label="Disabled select" options={options} disabled />
        </div>
      </div>
      <h2>Neutral field controls</h2>
      <div style={fieldGrid}>
        <div data-field="neutral-textarea">
          <Textarea aria-label="Neutral textarea" />
        </div>
        <div data-field="neutral-error-textarea">
          <Textarea aria-label="Neutral error textarea" status="error" />
        </div>
        <div data-field="neutral-warning-textarea">
          <Textarea aria-label="Neutral warning textarea" status="warning" />
        </div>
        <div data-field="neutral-disabled-textarea">
          <Textarea aria-label="Neutral disabled textarea" disabled />
        </div>
      </div>
      <h2>Field family shell states</h2>
      {(['default', 'error', 'warning', 'disabled'] as const).map((state) => (
        <div key={state} style={sectionStyle}>
          <h3>{state}</h3>
          <FamilyFields prefix={`target-${state}`} state={state} />
        </div>
      ))}
    </section>
  );
}

function GlobalBorderFields() {
  return (
    <ConfigProvider theme={{ tokens: { borderColor: '#7a5c00' } }} style={{ minHeight: 0 }}>
      <section aria-label="Global border fields" data-field-section="global" style={sectionStyle}>
        <h2>Global border color</h2>
        <div style={fieldGrid}>
          <div data-field="global-input">
            <Input aria-label="Global border input" />
          </div>
          <div data-field="global-select">
            <Select aria-label="Global border select" options={options} />
          </div>
          <div data-field="global-error-input">
            <Input aria-label="Global error input" status="error" />
          </div>
          <div data-field="global-error-select">
            <Select aria-label="Global error select" options={options} status="error" />
          </div>
          <div data-field="global-warning-input">
            <Input aria-label="Global warning input" status="warning" />
          </div>
          <div data-field="global-warning-select">
            <Select aria-label="Global warning select" options={options} status="warning" />
          </div>
          <div data-field="global-disabled-input">
            <Input aria-label="Global disabled input" disabled />
          </div>
          <div data-field="global-disabled-select">
            <Select aria-label="Global disabled select" options={options} disabled />
          </div>
        </div>
        <h2>Global field family border</h2>
        <FamilyFields prefix="target-global" />
        <h3>Global field family states</h3>
        <div style={fieldGrid}>
          <FamilyField field="target-global-error-date-picker" kind="date-picker" state="error" />
          <FamilyField
            field="target-global-warning-tree-select"
            kind="tree-select"
            state="warning"
          />
          <FamilyField field="target-global-disabled-cascader" kind="cascader" state="disabled" />
        </div>
      </section>
    </ConfigProvider>
  );
}

function NestedThemeFields() {
  return (
    <ConfigProvider
      theme={{ primaryColor: '#c026d3', tokens: { surfaceColor: '#fff7ed' } }}
      style={{ minHeight: 0 }}
    >
      <section aria-label="Nested theme fields" data-field-section="nested" style={sectionStyle}>
        <h2>Nested primary theme</h2>
        <div style={fieldGrid}>
          <div data-field="nested-input">
            <Input aria-label="Nested input" />
          </div>
          <div data-field="nested-select">
            <Select aria-label="Nested select" options={options} />
          </div>
          <div data-field="nested-error-input">
            <Input aria-label="Nested error input" status="error" />
          </div>
          <div data-field="nested-error-select">
            <Select aria-label="Nested error select" options={options} status="error" />
          </div>
          <div data-field="nested-warning-input">
            <Input aria-label="Nested warning input" status="warning" />
          </div>
          <div data-field="nested-warning-select">
            <Select aria-label="Nested warning select" options={options} status="warning" />
          </div>
          <div data-field="nested-disabled-input">
            <Input aria-label="Nested disabled input" disabled />
          </div>
          <div data-field="nested-disabled-select">
            <Select aria-label="Nested disabled select" options={options} disabled />
          </div>
        </div>
        <h2>Nested field family surface</h2>
        <FamilyFields prefix="target-nested" />
        <h3>Nested field family states</h3>
        <div style={fieldGrid}>
          <FamilyField field="target-nested-error-date-picker" kind="date-picker" state="error" />
          <FamilyField
            field="target-nested-warning-tree-select"
            kind="tree-select"
            state="warning"
          />
          <FamilyField field="target-nested-disabled-cascader" kind="cascader" state="disabled" />
        </div>
      </section>
    </ConfigProvider>
  );
}

function ExplicitOverrides() {
  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Input: {
              borderColor: '#6b21a8',
              hover: { borderColor: '#7c3aed' },
              focus: { borderColor: '#4c1d95' },
              disabled: { borderColor: '#a78bfa' },
            },
          },
        }}
        style={{ minHeight: 0 }}
      >
        <section
          aria-label="Input component overrides"
          data-field-section="input-overrides"
          style={sectionStyle}
        >
          <h2>Input component and state overrides</h2>
          <div style={fieldGrid}>
            <div data-field="override-input">
              <Input aria-label="Overridden input" />
            </div>
            <div data-field="override-input-disabled">
              <Input aria-label="Overridden disabled input" disabled />
            </div>
            <div data-field="input-override-sibling-select">
              <Select aria-label="Input override sibling select" options={options} />
            </div>
          </div>
        </section>
      </ConfigProvider>
      <ConfigProvider
        theme={{
          components: {
            Select: {
              borderColor: '#0f766e',
              hover: { borderColor: '#0d9488' },
              focus: { borderColor: '#115e59' },
              disabled: { borderColor: '#5eead4' },
            },
          },
        }}
        style={{ minHeight: 0 }}
      >
        <section
          aria-label="Select component overrides"
          data-field-section="select-overrides"
          style={sectionStyle}
        >
          <h2>Select component and state overrides</h2>
          <div style={fieldGrid}>
            <div data-field="override-select">
              <Select aria-label="Overridden select" options={options} />
            </div>
            <div data-field="override-select-disabled">
              <Select aria-label="Overridden disabled select" options={options} disabled />
            </div>
            <div data-field="select-override-sibling-input">
              <Input aria-label="Select override sibling input" />
            </div>
          </div>
        </section>
      </ConfigProvider>
      <ConfigProvider
        theme={{
          components: {
            AutoComplete: {
              borderColor: '#9a3412',
              focus: { borderColor: '#7c2d12' },
            },
            InputNumber: {
              borderColor: '#4d7c0f',
              focus: { borderColor: '#3f6212' },
            },
            Cascader: {
              borderColor: '#a21caf',
              focus: { borderColor: '#86198f' },
            },
            TreeSelect: {
              borderColor: '#0369a1',
              focus: { borderColor: '#075985' },
              disabled: { borderColor: '#7dd3fc' },
            },
            ColorPicker: {
              borderColor: '#b45309',
              focus: { borderColor: '#92400e' },
            },
            DatePicker: {
              borderColor: '#be123c',
              focus: { borderColor: '#9f1239' },
              disabled: { borderColor: '#fda4af' },
            },
          },
        }}
        style={{ minHeight: 0 }}
      >
        <section
          aria-label="Field family component overrides"
          data-field-section="family-overrides"
          style={sectionStyle}
        >
          <h2>Remaining family component and focus overrides</h2>
          <FamilyFields prefix="target-override" />
          <div style={fieldGrid}>
            <FamilyField
              field="target-override-disabled-date-picker"
              kind="date-picker"
              state="disabled"
            />
            <FamilyField
              field="target-override-disabled-tree-select"
              kind="tree-select"
              state="disabled"
            />
            <div data-field="target-override-sibling-textarea">
              <Textarea aria-label="Target override sibling textarea" />
            </div>
          </div>
        </section>
      </ConfigProvider>
    </>
  );
}

export function FieldColorContractFixture() {
  return (
    <ConfigProvider theme={{ primaryColor: '#1265f5', motion: false }}>
      <div style={{ display: 'grid', gap: 32, maxWidth: 720 }}>
        <DefaultFields />
        <GlobalBorderFields />
        <NestedThemeFields />
        <ConfigProvider theme={{ tokens: { borderColor: '#7a5c00' } }} style={{ minHeight: 0 }}>
          <ExplicitOverrides />
        </ConfigProvider>
      </div>
    </ConfigProvider>
  );
}
