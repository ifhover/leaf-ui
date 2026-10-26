import { Avatar, AvatarGroup } from '@ifhover/leaf-ui';
export function ExtensionDemo() {
  return (
    <AvatarGroup maxCount={3} aria-label="Team members">
      {['Ada', 'Ben', 'Cara', 'Dan', 'Eva'].map((name) => (
        <Avatar key={name} alt={name}>
          {name.slice(0, 1)}
        </Avatar>
      ))}
    </AvatarGroup>
  );
}
