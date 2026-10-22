import { Badge, Button } from '@ifhover/leaf-ui';
import { Mail } from 'lucide-react';
export function BadgeDot() {
  return (
    <Badge dot aria-label="有未读消息">
      <Button variant="outline" startIcon={<Mail />} aria-label="消息" />
    </Badge>
  );
}
