import { Badge, Button } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';

export function BadgeInside() {
  return (
    <Badge dot placement="inside" aria-label="有未读通知">
      <Button variant="outline" startIcon={<Bell />} aria-label="通知" />
    </Badge>
  );
}
