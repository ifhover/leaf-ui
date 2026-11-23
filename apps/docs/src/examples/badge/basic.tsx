import { Badge, Button } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';
export function BadgeBasic() {
  return (
    <Badge count={8} aria-label="8 条未读通知">
      <Button variant="outline" size="icon" aria-label="通知">
        <Bell />
      </Button>
    </Badge>
  );
}
