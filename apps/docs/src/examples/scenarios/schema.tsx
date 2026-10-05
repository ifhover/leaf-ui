import { Alert, Button, Form, FormField, Input, Space, useFormValidation } from '@sudden3/leaf-ui';
import { useState } from 'react';
import { z } from 'zod';

export function SchemaForm({ english = false }: { english?: boolean }) {
  const [saved, setSaved] = useState(false);
  const schema = z.object({
    account: z
      .string()
      .trim()
      .min(3, english ? 'Use at least three characters.' : '账号至少三个字符。'),
    email: z.email(english ? 'Enter a valid email address.' : '请输入有效邮箱。'),
  });
  const validation = useFormValidation({
    validate: (data) => {
      setSaved(false);
      const result = schema.safeParse({ account: data.get('account'), email: data.get('email') });
      const errors: Record<string, string> = {};
      if (!result.success)
        for (const issue of result.error.issues) {
          const name = String(issue.path[0]);
          errors[name] ??= issue.message;
        }
      return errors;
    },
    onSubmit: async (data, signal) => {
      // Replace the simulated transport with fetch(url, { signal, ... }).
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 400);
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            resolve();
          },
          { once: true },
        );
      });
      if (signal.aborted) return;
      if (data.get('account') === 'reserved')
        validation.setErrors({
          account: english ? 'This account is already in use.' : '此账号已被使用。',
        });
      else setSaved(true);
    },
  });
  return (
    <Form
      noValidate
      onSubmit={validation.handleSubmit}
      onReset={(event) => {
        validation.handleReset(event);
        setSaved(false);
      }}
    >
      <FormField label={english ? 'Account' : '账号'} error={validation.errors.account}>
        <Input name="account" placeholder="reserved" />
      </FormField>
      <FormField label={english ? 'Email' : '邮箱'} error={validation.errors.email}>
        <Input name="email" type="email" placeholder="name@example.com" />
      </FormField>
      <Space>
        <Button type="submit" loading={validation.pending}>
          {english ? 'Submit' : '提交'}
        </Button>
        <Button type="reset" variant="outline">
          {english ? 'Reset' : '重置'}
        </Button>
      </Space>
      <p className="leaf-demo-note">
        {english
          ? 'An account shorter than three characters fails schema validation. Use reserved with a valid email to see a server field error.'
          : '账号不足三个字符会出现 Schema 校验错误；使用 reserved 并填写有效邮箱，可查看服务端字段错误。'}
      </p>
      {saved && <Alert type="success" title={english ? 'Saved successfully.' : '保存成功。'} />}
    </Form>
  );
}
