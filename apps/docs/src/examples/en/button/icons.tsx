import { Button } from '@sudden3/leaf-ui';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';

export function ButtonIcons() {
  return (
    <>
      <Button startIcon={<Plus />}>New project</Button>
      <Button variant="outline" endIcon={<ArrowRight />}>
        Continue
      </Button>
      <Button variant="soft" aria-label="Add project" startIcon={<Plus />} />
      <Button danger variant="outline" aria-label="Delete project" startIcon={<Trash2 />} />
    </>
  );
}
