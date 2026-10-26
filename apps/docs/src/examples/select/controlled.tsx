import { Button, Form, FormField, Select, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function SelectControlled() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const error = submitted && !value;
  return (
    <Form
      layout="vertical"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <FormField label="项目可见性" error={error ? '请选择可见性' : undefined}>
        <Select
          name="visibility"
          value={value}
          onChange={setValue}
          allowClear
          status={error ? 'error' : undefined}
          placeholder="请选择"
          options={[
            { value: 'public', label: '公开' },
            { value: 'team', label: '团队' },
            { value: 'private', label: '私密' },
          ]}
        />
      </FormField>
      <Button type="submit">提交</Button>
      {submitted && value && <Text role="status">已提交：{value}</Text>}
    </Form>
  );
}
