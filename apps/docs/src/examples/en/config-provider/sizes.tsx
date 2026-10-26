import { Button, ConfigProvider, Flex, FormField, Grid, Slider, Text } from '@ifhover/leaf-ui';
import { Fragment, useState } from 'react';

export function ConfigProviderSizes() {
  const [height, setHeight] = useState(34);
  return (
    <Flex direction="column" gap="lg">
      <FormField label="Base height">
        <Slider min={28} max={44} value={height} onChange={setHeight} showValue={false} />
      </FormField>
      <Text tone="muted">Current height: {height}px</Text>
      <ConfigProvider theme={{ controlHeight: height }}>
        <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
          {(
            [
              ['sm', 'Small'],
              ['md', 'Medium'],
              ['lg', 'Large'],
            ] as const
          ).map(([size, label]) => (
            <Fragment key={size}>
              <Text tone="muted">{label}</Text>
              <Flex align="start">
                <Button size={size}>Button</Button>
              </Flex>
            </Fragment>
          ))}
        </Grid>
      </ConfigProvider>
    </Flex>
  );
}
