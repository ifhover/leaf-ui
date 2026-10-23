import { Badge, Button } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';

export function BadgeInside() {
  return (
    <Badge dot placement="inside" aria-label="Unread notifications">
      <Button variant="outline" startIcon={<Bell />} aria-label="Notifications" />
    </Badge>
  );
}
