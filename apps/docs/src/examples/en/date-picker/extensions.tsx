import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function ExtensionDemo() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      {(['year', 'quarter', 'month', 'week'] as const).map((picker) => (
        <FormField
          key={picker}
          label={{ year: 'Year', quarter: 'Quarter', month: 'Month', week: 'Week' }[picker]}
        >
          <DatePicker picker={picker} />
        </FormField>
      ))}
    </Form>
  );
}
