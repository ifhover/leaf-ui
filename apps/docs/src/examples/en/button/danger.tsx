import { Button } from '@sudden3/leaf-ui';
import { Trash2 } from 'lucide-react';

export function ButtonDanger() {
  return (
    <>
      <Button danger startIcon={<Trash2 />}>
        Delete project
      </Button>
      <Button danger variant="soft">
        Remove member
      </Button>
      <Button danger variant="outline">
        Revoke access
      </Button>
      <Button danger variant="ghost">
        Clear
      </Button>
      <Button danger disabled>
        Deletion disabled
      </Button>
      <Button danger loading>
        Deleting
      </Button>
    </>
  );
}
