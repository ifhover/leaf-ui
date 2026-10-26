import { Badge, Button, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';

export function BadgeCounts() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">数量上限</Text>
      <Flex align="center" wrap>
        <Badge count={120} aria-label="120 条未读通知">
          <Button startIcon={<Bell />} aria-label="通知" />
        </Badge>
      </Flex>
      <Text tone="muted">显示零值</Text>
      <Flex align="center" wrap>
        <Badge count={0} showZero aria-label="0 条未读通知">
          <Button startIcon={<Bell />} aria-label="通知" />
        </Badge>
      </Flex>
    </Grid>
  );
}
