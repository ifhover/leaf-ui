import { Avatar, Badge } from '@sudden3/leaf-ui';

export function AvatarBasic() {
  return (
    <div className="leaf-demo-row">
      <Avatar size="sm">LF</Avatar>
      <Avatar>LE</Avatar>
      <Avatar size="lg" shape="square">
        UI
      </Avatar>
      <Badge dot>
        <Avatar alt="未读消息">A</Avatar>
      </Badge>
      <Avatar src="data:image/png;base64,broken" alt="图片加载失败">
        LF
      </Avatar>
    </div>
  );
}
