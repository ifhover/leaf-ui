import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function ExtensionDemo() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      {(['year', 'quarter', 'month', 'week'] as const).map((picker) => (
        <FormField
          key={picker}
          label={{ year: '年份', quarter: '季度', month: '月份', week: '周' }[picker]}
        >
          <DatePicker picker={picker} />
        </FormField>
      ))}
    </Form>
  );
}
