import { Badge, Button, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';

export function BadgeCounts() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">Over limit</Text>
      <Flex align="center" wrap>
        <Badge count={120} aria-label="120 unread notifications">
          <Button startIcon={<Bell />} aria-label="Notifications" />
        </Badge>
      </Flex>
      <Text tone="muted">Show zero</Text>
      <Flex align="center" wrap>
        <Badge count={0} showZero aria-label="0 unread notifications">
          <Button startIcon={<Bell />} aria-label="Notifications" />
        </Badge>
      </Flex>
    </Grid>
  );
}
