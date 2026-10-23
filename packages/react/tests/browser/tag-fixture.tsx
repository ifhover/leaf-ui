import { CheckableTag, Tag, TagGroup } from '@ifhover/leaf-ui';

export function TagFixture() {
  return (
    <div data-testid="tag-fixture" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Tag data-testid="tag-default">Default</Tag>
        <Tag color="default" data-testid="tag-alias">
          Alias
        </Tag>
        <Tag color="success">Success</Tag>
        <Tag color="info">Info</Tag>
        <Tag color="warning">Warning</Tag>
        <Tag color="danger" data-testid="tag-danger-soft">
          Danger soft
        </Tag>
        <Tag color="danger" variant="outline" data-testid="tag-danger">
          Danger
        </Tag>
        <Tag color="#7654c6" data-testid="tag-custom">
          Custom
        </Tag>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <CheckableTag data-testid="tag-checkable">Toggle</CheckableTag>
        <TagGroup
          data-testid="tag-group"
          defaultValue={['active']}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'paused', label: 'Paused' },
          ]}
        />
      </div>
    </div>
  );
}
