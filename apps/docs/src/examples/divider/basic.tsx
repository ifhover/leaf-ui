import { Divider } from '@sudden3/leaf-ui';

export function DividerBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <p>项目信息</p>
      <Divider>设置</Divider>
      <Divider align="start" dashed>
        更多内容
      </Divider>
      <div>
        编辑
        <Divider type="vertical" />
        分享
        <Divider type="vertical" dashed />
        归档
      </div>
    </div>
  );
}
