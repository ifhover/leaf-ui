import { Badge, Button } from '@ifhover/leaf-ui';
import { Mail } from 'lucide-react';
export function BadgeDot() {
  return (
    <Badge dot aria-label="Unread messages">
      <Button variant="outline" size="icon" aria-label="Messages">
        <Mail />
      </Button>
    </Badge>
  );
}
