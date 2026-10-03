import { InputNumber } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function InputNumberBasic() {
  const [value, setValue] = useState<number | null>(3);
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-field">
        <label htmlFor="number-quantity">数量</label>
        <InputNumber
          id="number-quantity"
          name="quantity"
          min={0}
          max={20}
          value={value}
          onChange={setValue}
        />
      </div>
      <div className="leaf-demo-field">
        <label htmlFor="number-price">金额</label>
        <InputNumber
          id="number-price"
          min={0}
          step={0.1}
          precision={2}
          defaultValue={19.9}
          prefix="¥"
        />
      </div>
      <InputNumber
        aria-label="百分比"
        defaultValue={50}
        min={0}
        max={100}
        suffix="%"
        controls={false}
      />
      <div className="leaf-demo-row">
        <InputNumber aria-label="只读" defaultValue={12} readOnly />
        <InputNumber aria-label="禁用" defaultValue={8} disabled />
      </div>
      <p className="leaf-demo-note">当前数量：{value ?? '未填写'}</p>
    </div>
  );
}
