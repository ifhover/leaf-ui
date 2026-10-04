import { Avatar, AvatarGroup } from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <AvatarGroup maxCount={3}>
      {['Ada', 'Ben', 'Cara', 'Dan', 'Eva'].map((name) => (
        <Avatar key={name} alt={name}>
          {name.slice(0, 1)}
        </Avatar>
      ))}
    </AvatarGroup>
  );
}
