import { Badge, Button, Space } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';

export function BadgeFixture() {
  return (
    <Space wrap size={32}>
      <Badge count={8} aria-label="Short count">
        <Button variant="outline" startIcon={<Bell />} aria-label="Short count target" />
      </Badge>
      <Badge count="123456" aria-label="Long count">
        <Button variant="outline" startIcon={<Bell />} aria-label="Long count target" />
      </Badge>
      <Badge dot aria-label="Unread dot">
        <Button variant="outline" startIcon={<Bell />} aria-label="Dot target" />
      </Badge>
    </Space>
  );
}
