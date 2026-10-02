import { Button, Input, Select } from '@leaf-ui/react';
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
        setResult(`已创建：${data.get('title')}`);
      }}
    >
      <label htmlFor={`${id}-title`}>项目名称</label>
      <Input id={`${id}-title`} name="title" required placeholder="例如：Leaf Garden" />
      <label htmlFor={`${id}-team`}>所属团队</label>
      <Select
        id={`${id}-team`}
        name="team"
        required
        placeholder="请选择团队"
        options={[
          { label: '设计团队', value: 'design' },
          { label: '产品团队', value: 'product' },
        ]}
      />
      <Button type="submit" startIcon={<Plus />}>
        创建项目
      </Button>
      <span aria-live="polite">{result}</span>
    </form>
  );
}
