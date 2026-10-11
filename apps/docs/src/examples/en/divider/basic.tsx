import { Divider, Space } from '@ifhover/leaf-ui';

export function DividerBasic() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack leaf-demo-stack--wide">
      <p>Project details</p>
      <Divider>Settings</Divider>
      <Divider align="start" dashed>
        More content
      </Divider>
      <div>
        Edit
        <Divider type="vertical" />
        Share
        <Divider type="vertical" dashed />
        Archive
      </div>
    </Space>
  );
}
