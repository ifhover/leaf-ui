import { Badge, Button } from '@sudden3/leaf-ui';
import { Bell, Mail } from 'lucide-react';
export function BadgeBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-row">
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">8 notifications</span>
          <Badge count={8} aria-label="8 notifications">
            <Button variant="outline" startIcon={<Bell />} aria-label="Notifications" />
          </Badge>
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">Overflow count</span>
          <Badge count={120}>
            <Button variant="outline">Inbox</Button>
          </Badge>
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">New messages</span>
          <Badge dot aria-label="New messages">
            <Button variant="ghost" startIcon={<Mail />} aria-label="Messages" />
          </Badge>
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">Show zero</span>
          <Badge count={0} showZero color="#7654c6" />
        </div>
      </div>
      <div className="leaf-demo-row">
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">Notification count</span>
          <Badge status="success" text="Running" />
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">Warning feedback</span>
          <Badge status="warning" text="Pending" />
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">Error feedback</span>
          <Badge status="error" text="Stopped" />
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">Notification count</span>
          <Badge status="info" text="Updating" />
        </div>
      </div>
    </div>
  );
}
