import { Space, Tabs } from '@ifhover/leaf-ui';

const items = [
  { key: 'design', label: 'Design', children: 'Design settings' },
  { key: 'tokens', label: 'Tokens', children: 'Theme tokens' },
];
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <Space direction="vertical" align="stretch" size="sm">
        <span>{english ? 'Bottom placement' : '底部标签页'}</span>
        <Tabs
          aria-label={english ? 'Bottom tabs' : '底部标签页'}
          placement="bottom"
          items={items}
        />
      </Space>
      <Space direction="vertical" align="stretch" size="sm">
        <span>{english ? 'Right placement' : '右侧标签页'}</span>
        <Tabs aria-label={english ? 'Right tabs' : '右侧标签页'} placement="right" items={items} />
      </Space>
    </Space>
  );
}
