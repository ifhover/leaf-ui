import { Avatar, Badge } from '@sudden3/leaf-ui';
export function AvatarBasic() {
  return (
    <div className="leaf-demo-row">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Small</span>
        <Avatar size="sm">LF</Avatar>
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Medium</span>
        <Avatar>LE</Avatar>
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Large · Square</span>
        <Avatar size="lg" shape="square">
          UI
        </Avatar>
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Unread indicator</span>
        <Badge dot>
          <Avatar alt="Unread messages">A</Avatar>
        </Badge>
      </div>
    </div>
  );
}
