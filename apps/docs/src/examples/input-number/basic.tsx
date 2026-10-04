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
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">百分比</span>
        <InputNumber
          aria-label="百分比"
          defaultValue={50}
          min={0}
          max={100}
          suffix="%"
          controls={false}
        />
      </div>
      <div className="leaf-demo-row">
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">只读</span>
          <InputNumber aria-label="只读" defaultValue={12} readOnly />
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">禁用</span>
          <InputNumber aria-label="禁用" defaultValue={8} disabled />
        </div>
      </div>
      <p className="leaf-demo-note">当前数量：{value ?? '未填写'}</p>
    </div>
  );
}
