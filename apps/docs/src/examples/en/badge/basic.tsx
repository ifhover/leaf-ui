import { Badge, Button, Space } from '@ifhover/leaf-ui';
import { Bell, Mail } from 'lucide-react';

export function BadgeBasic() {
  return (
    <Badge count={8} aria-label="8 unread notifications">
      <Button variant="outline" startIcon={<Bell />} aria-label="Notifications" />
    </Badge>
  );
}

export function BadgeCounts() {
  return (
    <Space wrap size={32}>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Count limit</span>
        <Badge count={120}>
          <Button variant="outline" startIcon={<Bell />} aria-label="Notifications" />
        </Badge>
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Show zero</span>
        <Badge count={0} showZero>
          <Button variant="outline" startIcon={<Bell />} aria-label="Notifications" />
        </Badge>
      </div>
    </Space>
  );
}

export function BadgeDot() {
  return (
    <Badge dot aria-label="Unread messages">
      <Button variant="outline" startIcon={<Mail />} aria-label="Messages" />
    </Badge>
  );
}

export function BadgeStatuses() {
  return (
    <Space wrap size={24}>
      <Badge status="success" text="Running" />
      <Badge status="warning" text="Pending" />
      <Badge status="error" text="Stopped" />
      <Badge status="info" text="Updating" />
      <Badge status="default" text="Inactive" />
    </Space>
  );
}
