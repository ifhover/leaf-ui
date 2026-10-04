import { Avatar, Badge } from '@sudden3/leaf-ui';
export function AvatarBasic() {
  return (
    <div className="leaf-demo-row">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">小尺寸</span>
        <Avatar size="sm">LF</Avatar>
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">默认尺寸</span>
        <Avatar>LE</Avatar>
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">大尺寸 · 方形</span>
        <Avatar size="lg" shape="square">
          UI
        </Avatar>
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">未读提醒</span>
        <Badge dot>
          <Avatar alt="未读消息">A</Avatar>
        </Badge>
      </div>
    </div>
  );
}
