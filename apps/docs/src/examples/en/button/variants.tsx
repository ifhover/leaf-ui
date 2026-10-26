import { Button, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const options = [
  { value: 'outline', label: 'Outline' },
  { value: 'solid', label: 'Solid' },
  { value: 'text', label: 'Text' },
  { value: 'link', label: 'Link' },
] as const;

export function ButtonVariants() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      {options.map(({ value, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex align="center" wrap>
            <Button variant={value}>Save</Button>
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
