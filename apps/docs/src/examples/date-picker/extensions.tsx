import { DatePicker, Space } from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <Space wrap>
      {(['year', 'quarter', 'month', 'week'] as const).map((picker) => (
        <label key={picker} htmlFor={`period-${picker}`}>
          {{ year: '年份', quarter: '季度', month: '月份', week: '周' }[picker]}
          <DatePicker id={`period-${picker}`} picker={picker} />
        </label>
      ))}
    </Space>
  );
}
