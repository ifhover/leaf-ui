import { DatePicker, Space } from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <Space wrap>
      {(['year', 'quarter', 'month', 'week'] as const).map((picker) => (
        <label key={picker} htmlFor={`period-${picker}`}>
          {{ year: 'Year', quarter: 'Quarter', month: 'Month', week: 'Week' }[picker]}
          <DatePicker id={`period-${picker}`} picker={picker} />
        </label>
      ))}
    </Space>
  );
}
