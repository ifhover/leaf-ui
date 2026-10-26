import { Avatar, AvatarGroup, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const sizes = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
] as const;

export function AvatarSizes() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      {sizes.map(({ value, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex align="center" wrap>
            <AvatarGroup size={value} aria-label={`${label} team member avatars`}>
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
