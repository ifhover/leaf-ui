import { Select, type SelectOption } from '@sudden3/leaf-ui';

const options: SelectOption[] = [
  { value: 'garden', label: 'Leaf Garden Design System' },
  { value: 'studio', label: 'Leaf Studio' },
  { value: 'notes', label: 'Leaf Notes' },
];
export function SelectPopup() {
  return (
    <div className="leaf-demo-stack">
      <Select
        aria-label="自动浮层宽度"
        style={{ width: 180 }}
        options={options}
        defaultValue="studio"
      />
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
      <Select
        aria-label="多选数量限制"
        multiple
        options={options}
        defaultValue={['studio', 'notes']}
        maxCount={2}
        maxTagCount={1}
        allowClear
      />
      <Select aria-label="加载选项" options={[]} loading placeholder="加载中" />
      <Select aria-label="空选项" options={[]} notFoundContent="还没有项目" />
    </div>
  );
}
