import { Badge, Button } from '@sudden3/leaf-ui';
import { Bell, Mail } from 'lucide-react';
export function BadgeBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-row">
        <Badge count={8} aria-label="8 notifications">
          <Button variant="outline" startIcon={<Bell />} aria-label="Notifications" />
        </Badge>
        <Badge count={120}>
          <Button variant="outline">Inbox</Button>
        </Badge>
        <Badge dot aria-label="New messages">
          <Button variant="ghost" startIcon={<Mail />} aria-label="Messages" />
        </Badge>
        <Badge count={0} showZero color="#7654c6" />
      </div>
      <div className="leaf-demo-row">
        <Badge status="success" text="Running" />
        <Badge status="warning" text="Pending" />
        <Badge status="error" text="Stopped" />
        <Badge status="info" text="Updating" />
      </div>
    </div>
  );
}
