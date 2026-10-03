import { Button, Form, FormField, Input, Select } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function FormBasic() {
  const [result, setResult] = useState('');
  return (
    <Form
      className="leaf-demo-stack leaf-demo-stack--wide"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setResult(`${data.get('name')} · ${data.get('email')} · ${data.get('team')}`);
      }}
      onReset={() => setResult('')}
    >
      <FormField label="姓名" required>
        <Input name="name" placeholder="你的姓名" />
      </FormField>
      <FormField label="工作邮箱" required help="用于接收项目通知">
        <Input name="email" type="email" placeholder="hello@example.com" />
      </FormField>
      <FormField label="所属团队" required>
        <Select
          name="team"
          options={[
            { value: 'design', label: '设计团队' },
            { value: 'engineering', label: '工程团队' },
          ]}
        />
      </FormField>
      <FormField>
        <div className="leaf-demo-row">
          <Button type="submit">提交</Button>
          <Button type="reset" variant="outline">
            重置
          </Button>
        </div>
      </FormField>
      {result && <output className="leaf-demo-note">{result}</output>}
    </Form>
  );
}
