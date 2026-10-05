import { Form, FormField, InputNumber, Space } from '@sudden3/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Form>
      <Space direction="vertical" align="stretch">
        <FormField label={english ? 'Grouped amount' : '金额与千分位'}>
          <InputNumber defaultValue={12345.67} precision={2} grouping prefix="$" />
        </FormField>
        <FormField label={english ? 'Exact decimal string' : '高精度十进制字符串'}>
          <InputNumber
            stringMode
            name="amount"
            defaultValue="9007199254740993.01"
            step="0.01"
            precision={2}
          />
        </FormField>
        <FormField label={english ? 'Custom percent format' : '自定义百分比显示'}>
          <InputNumber
            defaultValue={15}
            min={0}
            max={100}
            formatter={(value) => (value == null ? '' : `${value}%`)}
            parser={(text) => text.replace('%', '')}
          />
        </FormField>
      </Space>
    </Form>
  );
}
