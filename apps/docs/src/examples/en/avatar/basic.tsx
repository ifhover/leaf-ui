import { Avatar, AvatarGroup } from '@ifhover/leaf-ui';
export function AvatarBasic() {
  return (
    <AvatarGroup aria-label="Team members">
      {['Ada', 'Ben', 'Cara', 'Dan', 'Eva'].map((name) => (
        <Avatar key={name} alt={name}>
          {name.slice(0, 1)}
        </Avatar>
      ))}
    </AvatarGroup>
  );
}
