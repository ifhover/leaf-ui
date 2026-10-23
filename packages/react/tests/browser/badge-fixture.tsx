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
      <Badge count={8} aria-label="Standalone count" />
      <Badge count="NEW" aria-label="Standalone text" />
      <Badge dot aria-label="Standalone dot" />
      <Space wrap data-testid="inside-badges">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Badge key={size} dot placement="inside" aria-label={`Unread ${size}`}>
            <Button size={size} startIcon={<Bell />} aria-label={`Inside ${size}`} />
          </Badge>
        ))}
        <Badge dot placement="inside" aria-label="Unread notifications">
          <Button variant="solid">Notifications</Button>
        </Badge>
      </Space>
    </Space>
  );
}
