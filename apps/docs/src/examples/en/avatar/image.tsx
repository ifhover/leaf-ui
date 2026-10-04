import { Avatar } from '@sudden3/leaf-ui';
export function AvatarImage() {
  const image = '../../avatar-portrait.svg';
  return (
    <div className="leaf-demo-row">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Circle image</span>
        <Avatar src={image} alt="Alex" size="lg" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Square image</span>
        <Avatar src={image} alt="Alex" size={64} shape="square" imageProps={{ loading: 'lazy' }} />
      </div>
    </div>
  );
}
