import { Badge, Button } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';
export function BadgeBasic() {
  return (
    <Badge count={8} aria-label="8 unread notifications">
      <Button variant="outline" size="icon" aria-label="Notifications">
        <Bell />
      </Button>
    </Badge>
  );
}
