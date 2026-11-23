import { Badge, Button } from '@ifhover/leaf-ui';
import { Mail } from 'lucide-react';
export function BadgeDot() {
  return (
    <Badge dot aria-label="有未读消息">
      <Button variant="outline" size="icon" aria-label="消息">
        <Mail />
      </Button>
    </Badge>
  );
}
