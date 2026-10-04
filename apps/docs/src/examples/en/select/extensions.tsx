import { Select, Space } from '@sudden3/leaf-ui';

const many = Array.from({ length: 5000 }, (_, i) => ({
  value: String(i),
  label: `Item ${i + 1}`,
}));
export function ExtensionDemo() {
  return (
    <Space direction="vertical" align="stretch">
      <label htmlFor="select-extension-1">
        Groups and creation
        <Select
          id="select-extension-1"
          multiple
          showSearch
          allowCreate
          options={[
            {
              label: 'Design',
              options: [
                { value: 'ui', label: 'UI design' },
                { value: 'ux', label: 'UX design' },
              ],
            },
            { label: 'Engineering', options: [{ value: 'web', label: 'Web development' }] },
          ]}
          placeholder="Select or create tags"
        />
      </label>
      <label htmlFor="select-extension-2">
        5000 options
        <Select
          id="select-extension-2"
          showSearch
          virtual
          options={many}
          placeholder="Search and select"
        />
      </label>
    </Space>
  );
}
