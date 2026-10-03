import { Divider } from '@sudden3/leaf-ui';

export function DividerBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
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
    </div>
  );
}
