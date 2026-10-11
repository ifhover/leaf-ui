import { Space, Tabs } from '@ifhover/leaf-ui';

const items = [
  { key: 'design', label: 'Design', children: 'Design settings' },
  { key: 'tokens', label: 'Tokens', children: 'Theme tokens' },
];
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <div className="leaf-demo-case">
        <p style={{ margin: '0 0 8px' }}>{english ? 'Bottom placement' : '底部标签页'}</p>
        <Tabs placement="bottom" items={items} />
      </div>
      <div className="leaf-demo-case">
        <p style={{ margin: '0 0 8px' }}>{english ? 'Right placement' : '右侧标签页'}</p>
        <Tabs placement="right" items={items} />
      </div>
    </Space>
  );
}
