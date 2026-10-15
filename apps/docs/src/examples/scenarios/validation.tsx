import { Button, Flex, Form, FormField, Input, Text, useFormValidation } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function AsyncValidation({ english = false }: { english?: boolean }) {
  const [summary, setSummary] = useState('');
  const validation = useFormValidation({
    validate: async (data, signal): Promise<Record<string, string>> => {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 250);
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            resolve();
          },
          { once: true },
        );
      });
      if (signal.aborted) return {};
      const name = String(data.get('name') ?? '').trim();
      return name.length < 2
        ? { name: english ? 'Use at least two characters.' : '名称至少两个字符。' }
        : {};
    },
    onSubmit: async (data) => {
      setSummary(String(data.get('name') ?? ''));
    },
  });
  return (
    <Form
      layout="vertical"
      onSubmit={validation.handleSubmit}
      onReset={(event) => {
        validation.handleReset(event);
        setSummary('');
      }}
      disabled={validation.pending}
    >
      <FormField label={english ? 'Project' : '项目名称'} required error={validation.errors.name}>
        <Input name="name" placeholder="Leaf Garden" />
      </FormField>
      <Flex gap="sm" wrap>
        <Button type="submit" loading={validation.pending}>
          {english ? 'Save' : '保存'}
        </Button>
        <Button type="reset" variant="outline">
          {english ? 'Reset' : '重置'}
        </Button>
      </Flex>
      {summary && (
        <Text role="status">
          {english ? 'Saved: ' : '已保存：'}
          {summary}
        </Text>
      )}
    </Form>
  );
}
