import { Select, Tag } from '@ifhover/leaf-ui';

const options = [
  { value: 'design', label: '设计工作室' },
  { value: 'product', label: '产品团队' },
  { value: 'engineering', label: '工程团队' },
  { value: 'archived', label: '归档项目', disabled: true },
];

export function CustomTags() {
  return (
    <Select
      aria-label="自定义团队标签"
      multiple
      defaultValue={['design', 'product']}
      options={options}
      placeholder="选择团队"
      tagRender={(option, remove) => (
        <Tag closable onClose={remove}>
          {option.label}
        </Tag>
      )}
    />
  );
}
