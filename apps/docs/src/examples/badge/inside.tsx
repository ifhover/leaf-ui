import { Badge, Button } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';

export function BadgeInside() {
  return (
    <Badge dot placement="inside" aria-label="有未读通知">
      <Button variant="outline" size="icon" aria-label="通知">
        <Bell />
      </Button>
    </Badge>
  );
}
