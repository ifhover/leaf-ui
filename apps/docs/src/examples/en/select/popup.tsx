import type { SelectOption } from '@ifhover/leaf-ui';
import { Form, FormField, Select } from '@ifhover/leaf-ui';

const options: SelectOption[] = [
  { value: 'garden', label: 'Leaf Garden Design System' },
  { value: 'studio', label: 'Leaf Studio' },
  { value: 'notes', label: 'Leaf Notes' },
];
export function SelectPopup() {
  return (
    <Form layout="vertical">
      <FormField label="Automatic popup width">
        <Select
          aria-label="Automatic popup width"
          style={{ width: 180 }}
          options={options}
          defaultValue="studio"
        />
      </FormField>
      <FormField label="Fixed popup width">
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
      </FormField>
      <FormField label="Selection limit">
        <Select
          aria-label="Selection limit"
          multiple
          options={options}
          defaultValue={['studio', 'notes']}
          maxCount={2}
          maxTagCount={1}
          allowClear
        />
      </FormField>
      <FormField label="Loading options">
        <Select aria-label="Loading options" options={[]} loading placeholder="Loading" />
      </FormField>
      <FormField label="Empty options">
        <Select aria-label="Empty options" options={[]} notFoundContent="No projects yet" />
      </FormField>
    </Form>
  );
}
