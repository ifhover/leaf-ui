import { Avatar } from '@sudden3/leaf-ui';
export function AvatarFallback() {
  return (
    <div className="leaf-demo-row">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">加载失败时显示文字</span>
        <Avatar src="data:image/png;base64,broken" alt="图片加载失败">
          LF
        </Avatar>
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">未设置图片时显示默认图标</span>
        <Avatar alt="访客" />
      </div>
    </div>
  );
}
