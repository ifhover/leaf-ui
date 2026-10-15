import { Form, FormField, Select } from '@ifhover/leaf-ui';

const options = [
  { value: '0', label: '一个名称比较长的产品设计团队' },
  { value: '1', label: '前端开发' },
  { value: '2', label: '服务端开发' },
  { value: '3', label: '日常运营' },
];
const selected = options.map((option) => option.value);

export function SingleLine() {
  return (
    <Form layout="vertical">
      <FormField label="单行显示 · 长标签自动省略">
        <Select
          multiple
          showSearch
          allowClear
          tagWrap={false}
          options={options}
          defaultValue={selected}
        />
      </FormField>
      <FormField label="默认换行">
        <Select multiple options={options} defaultValue={selected} />
      </FormField>
    </Form>
  );
}
