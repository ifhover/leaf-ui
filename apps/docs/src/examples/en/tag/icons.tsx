import { Flex, Grid, Tag, Text } from '@ifhover/leaf-ui';
import { Sparkles } from 'lucide-react';

export function TagIcons() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">Default dot</Text>
      <Flex align="center" wrap>
        <Tag>In progress</Tag>
      </Flex>
      <Text tone="muted">No dot</Text>
      <Flex align="center" wrap>
        <Tag dot={false}>In progress</Tag>
      </Flex>
      <Text tone="muted">Custom icon</Text>
      <Flex align="center" wrap>
        <Tag icon={<Sparkles />}>In progress</Tag>
      </Flex>
    </Grid>
  );
}
