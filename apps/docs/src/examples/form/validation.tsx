import { Button, Flex, Form, FormField, Input, Text, useFormValidation } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function FormValidation() {
  const [saved, setSaved] = useState('');
  const validation = useFormValidation({
    validate: (data) => {
      const errors: Record<string, string> = {};
      if (!String(data.get('name') ?? '').trim()) errors.name = '请输入姓名';
      return errors;
    },
    onSubmit: (data) => setSaved(String(data.get('name')).trim()),
  });
  return (
    <Form
      noValidate
      onSubmit={validation.handleSubmit}
      onReset={(event) => {
        validation.handleReset(event);
        setSaved('');
      }}
    >
      <FormField label="姓名" required error={validation.errors.name}>
        <Input
          name="name"
          onChange={() => {
            validation.clearErrors('name');
            setSaved('');
          }}
        />
      </FormField>
      <FormField>
        <Flex gap="sm" wrap>
          <Button type="submit" loading={validation.pending}>
            保存
          </Button>
          <Button type="reset" variant="outline">
            重置
          </Button>
        </Flex>
      </FormField>
      {saved && (
        <FormField>
          <Text role="status" tone="muted">
            已保存：{saved}
          </Text>
        </FormField>
      )}
    </Form>
  );
}
