import { CheckableTag, Space, TagGroup } from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <Space direction="vertical" align="start">
      <CheckableTag defaultChecked>Favorites only</CheckableTag>
      <TagGroup
        aria-label="Tag filters"
        options={[
          { value: 'design', label: 'Design' },
          { value: 'dev', label: 'Development' },
          { value: 'photo', label: 'Photography' },
        ]}
        defaultValue={['design']}
      />
    </Space>
  );
}
