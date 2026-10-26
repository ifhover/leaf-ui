import { Flex, Grid, Tag, Text } from '@ifhover/leaf-ui';
import { Sparkles } from 'lucide-react';

export function TagIcons() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">默认圆点</Text>
      <Flex align="center" wrap>
        <Tag>进行中</Tag>
      </Flex>
      <Text tone="muted">无圆点</Text>
      <Flex align="center" wrap>
        <Tag dot={false}>进行中</Tag>
      </Flex>
      <Text tone="muted">自定义图标</Text>
      <Flex align="center" wrap>
        <Tag icon={<Sparkles />}>进行中</Tag>
      </Flex>
    </Grid>
  );
}
