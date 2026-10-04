import { Select, Space } from '@sudden3/leaf-ui';

const many = Array.from({ length: 5000 }, (_, i) => ({
  value: String(i),
  label: `项目 ${i + 1}`,
}));
export function ExtensionDemo() {
  return (
    <Space direction="vertical" align="stretch">
      <label htmlFor="select-extension-1">
        分组与自由创建
        <Select
          id="select-extension-1"
          multiple
          showSearch
          allowCreate
          options={[
            {
              label: '设计',
              options: [
                { value: 'ui', label: '界面设计' },
                { value: 'ux', label: '体验设计' },
              ],
            },
            { label: '工程', options: [{ value: 'web', label: '前端开发' }] },
          ]}
          placeholder="选择或创建标签"
        />
      </label>
      <label htmlFor="select-extension-2">
        5000 个选项
        <Select
          id="select-extension-2"
          showSearch
          virtual
          options={many}
          placeholder="搜索并选择"
        />
      </label>
    </Space>
  );
}
