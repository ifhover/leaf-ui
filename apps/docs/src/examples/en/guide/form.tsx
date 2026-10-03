import { Button, Input, Select } from '@sudden3/leaf-ui';
import { Plus } from 'lucide-react';
import { useId, useState } from 'react';

export function GettingStartedForm() {
  const id = useId();
  const [result, setResult] = useState('');
  return (
    <form
      style={{ display: 'grid', gap: 12, width: 'min(100%, 360px)' }}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setResult(`Created:${data.get('title')}`);
      }}
    >
      <label htmlFor={`${id}-title`}>Project name</label>
      <Input id={`${id}-title`} name="title" required placeholder="For example: Leaf Garden" />
      <label htmlFor={`${id}-team`}>Team</label>
      <Select
        id={`${id}-team`}
        name="team"
        required
        placeholder="Select a team"
        options={[
          { label: 'Design team', value: 'design' },
          { label: 'Product team', value: 'product' },
        ]}
      />
      <Button type="submit" startIcon={<Plus />}>
        Create project
      </Button>
      <span aria-live="polite">{result}</span>
    </form>
  );
}
