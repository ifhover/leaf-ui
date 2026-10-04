import { Avatar } from '@sudden3/leaf-ui';
export function AvatarFallback() {
  return (
    <div className="leaf-demo-row">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Text fallback</span>
        <Avatar src="data:image/png;base64,broken" alt="Failed image">
          LF
        </Avatar>
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Default icon</span>
        <Avatar alt="Guest" />
      </div>
    </div>
  );
}
