import { Form, FormField, InputNumber } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function InputNumberBasic() {
  const [value, setValue] = useState<number | null>(3);
  return (
    <Form layout="vertical" className="leaf-demo-stack">
      <FormField label="数量">
        <InputNumber name="quantity" min={0} max={20} value={value} onChange={setValue} />
      </FormField>
      <FormField label="金额">
        <InputNumber min={0} step={0.1} precision={2} defaultValue={19.9} prefix="¥" />
      </FormField>
      <FormField label="百分比">
        <InputNumber defaultValue={50} min={0} max={100} suffix="%" controls={false} />
      </FormField>
      <FormField label="只读">
        <InputNumber defaultValue={12} readOnly />
      </FormField>
      <FormField label="禁用">
        <InputNumber defaultValue={8} disabled />
      </FormField>
      <p className="leaf-demo-note">当前数量：{value ?? '未填写'}</p>
    </Form>
  );
}
