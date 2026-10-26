import { Avatar, AvatarGroup, Button, ConfigProvider, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';

const names = ['Ada', 'Ben', 'Cara', 'Dan', 'Eva', 'Fran'];

export function AvatarFixture() {
  const [expanded, setExpanded] = useState(false);
  return (
    <Space direction="vertical">
      <Button onClick={() => setExpanded(!expanded)}>Toggle members</Button>
      <AvatarGroup aria-label="Members" maxCount={expanded ? Infinity : 3}>
        {names.map((name) => (
          <Avatar key={name} alt={name}>
            {name.slice(0, 1)}
          </Avatar>
        ))}
      </AvatarGroup>
      <AvatarGroup aria-label="Fallbacks">
        <Avatar src="data:image/png;base64,broken" alt="Failed image">
          A
        </Avatar>
        <Avatar alt="Guest" />
      </AvatarGroup>
      <ConfigProvider theme={{ primaryColor: '#9354c6', tokens: { infoColor: '#007f8c' } }}>
        <AvatarGroup aria-label="Custom palette">
          {names.map((name) => (
            <Avatar key={name} alt={name}>
              {name[0]}
            </Avatar>
          ))}
        </AvatarGroup>
      </ConfigProvider>
      <ConfigProvider
        theme={{ components: { Avatar: { background: '#203040', color: '#ffffff' } } }}
      >
        <AvatarGroup aria-label="Explicit paint">
          <Avatar alt="Themed">T</Avatar>
          <Avatar alt="Inline" style={{ background: 'rgb(60, 70, 80)' }}>
            I
          </Avatar>
        </AvatarGroup>
      </ConfigProvider>
      <Avatar alt="Standalone">S</Avatar>
    </Space>
  );
}
