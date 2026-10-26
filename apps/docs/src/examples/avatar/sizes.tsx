import { Avatar, AvatarGroup, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const sizes = [
  { value: 'sm', label: '小' },
  { value: 'md', label: '中' },
  { value: 'lg', label: '大' },
] as const;

export function AvatarSizes() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      {sizes.map(({ value, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex align="center" wrap>
            <AvatarGroup size={value} aria-label={`${label}号团队成员头像`}>
              {['Ada', 'Ben', 'Cara'].map((name) => (
                <Avatar key={name} alt={name}>
                  {name.slice(0, 1)}
                </Avatar>
              ))}
            </AvatarGroup>
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
