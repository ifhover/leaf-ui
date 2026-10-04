import { Select, type SelectOption } from '@sudden3/leaf-ui';

const options: SelectOption[] = [
  { value: 'garden', label: 'Leaf Garden Design System' },
  { value: 'studio', label: 'Leaf Studio' },
  { value: 'notes', label: 'Leaf Notes' },
];
export function SelectPopup() {
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Automatic popup width</span>
        <Select
          aria-label="Automatic popup width"
          style={{ width: 180 }}
          options={options}
          defaultValue="studio"
        />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Fixed popup width</span>
        <Select
          aria-label="Fixed popup width"
          popupWidth={300}
          popupMaxWidth={360}
          style={{ width: 180 }}
          options={options}
          optionRender={(option) => (
            <div>
              <strong>{option.label}</strong>
              <div style={{ fontSize: 12, opacity: 0.65 }}>{option.value}</div>
            </div>
          )}
        />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Selection limit</span>
        <Select
          aria-label="Selection limit"
          multiple
          options={options}
          defaultValue={['studio', 'notes']}
          maxCount={2}
          maxTagCount={1}
          allowClear
        />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Loading options</span>
        <Select aria-label="Loading options" options={[]} loading placeholder="Loading" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Empty options</span>
        <Select aria-label="Empty options" options={[]} notFoundContent="No projects yet" />
      </div>
    </div>
  );
}
