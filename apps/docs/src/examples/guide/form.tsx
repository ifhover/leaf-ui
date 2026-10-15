import { Button, Form, FormField, Input, Select, Text } from '@ifhover/leaf-ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
export function GettingStartedForm() {
  const [result, setResult] = useState('');
  return (
    <Form
      layout="vertical"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setResult(`已创建：${data.get('title')}`);
      }}
    >
      <FormField label="项目名称" required>
        <Input name="title" placeholder="Leaf Garden" />
      </FormField>
      <FormField label="所属团队" required>
        <Select
          name="team"
          placeholder="请选择团队"
          options={[
            { label: '设计团队', value: 'design' },
            { label: '工程团队', value: 'engineering' },
          ]}
        />
      </FormField>
      <Button type="submit" startIcon={<Plus />}>
        创建项目
      </Button>
      {result && (
        <Text role="status" tone="muted">
          {result}
        </Text>
      )}
    </Form>
  );
}
