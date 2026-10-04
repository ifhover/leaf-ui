import { CheckableTag, Space, TagGroup } from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <Space direction="vertical" align="start">
      <CheckableTag defaultChecked>只看收藏</CheckableTag>
      <TagGroup
        aria-label="标签筛选"
        options={[
          { value: 'design', label: '设计' },
          { value: 'dev', label: '开发' },
          { value: 'photo', label: '摄影' },
        ]}
        defaultValue={['design']}
      />
    </Space>
  );
}
