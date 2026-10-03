import { InputNumber } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function InputNumberBasic() {
  const [value, setValue] = useState<number | null>(3);
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-field">
        <label htmlFor="number-quantity">Quantity</label>
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
        <label htmlFor="number-price">Price</label>
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
        aria-label="Percentage"
        defaultValue={50}
        min={0}
        max={100}
        suffix="%"
        controls={false}
      />
      <div className="leaf-demo-row">
        <InputNumber aria-label="Read only" defaultValue={12} readOnly />
        <InputNumber aria-label="Disabled" defaultValue={8} disabled />
      </div>
      <p className="leaf-demo-note">Current quantity: {value ?? 'Empty'}</p>
    </div>
  );
}
