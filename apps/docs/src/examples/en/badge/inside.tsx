import { Badge, Button } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';

export function BadgeInside() {
  return (
    <Badge dot placement="inside" aria-label="Unread notifications">
      <Button variant="outline" size="icon" aria-label="Notifications">
        <Bell />
      </Button>
    </Badge>
  );
}
