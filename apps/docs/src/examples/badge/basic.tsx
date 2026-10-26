import { Badge, Button } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';
export function BadgeBasic() {
  return (
    <Badge count={8} aria-label="8 条未读通知">
      <Button variant="outline" startIcon={<Bell />} aria-label="通知" />
    </Badge>
  );
}
