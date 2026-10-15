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
      <FormField label="自动浮层宽度">
        <Select
          aria-label="自动浮层宽度"
          style={{ width: 180 }}
          options={options}
          defaultValue="studio"
        />
      </FormField>
      <FormField label="固定浮层宽度">
        <Select
          aria-label="固定浮层宽度"
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
      <FormField label="多选数量限制">
        <Select
          aria-label="多选数量限制"
          multiple
          options={options}
          defaultValue={['studio', 'notes']}
          maxCount={2}
          maxTagCount={1}
          allowClear
        />
      </FormField>
      <FormField label="加载选项">
        <Select aria-label="加载选项" options={[]} loading placeholder="加载中" />
      </FormField>
      <FormField label="空选项">
        <Select aria-label="空选项" options={[]} notFoundContent="还没有项目" />
      </FormField>
    </Form>
  );
}
