import { Badge, Button } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';
export function BadgeBasic() {
  return (
    <Badge count={8} aria-label="8 unread notifications">
      <Button variant="outline" startIcon={<Bell />} aria-label="Notifications" />
    </Badge>
  );
}
