import { Checkbox } from '@sudden3/leaf-ui';
import { useState } from 'react';

const options = ['Design updates', 'Product news', 'Weekly updates'];

export function CheckboxCheckAll() {
  const [selected, setSelected] = useState<string[]>(['Design updates']);
  const allChecked = selected.length === options.length;
  return (
    <div className="leaf-demo-stack">
      <Checkbox
        checked={allChecked}
        indeterminate={selected.length > 0 && !allChecked}
        onChange={(event) => setSelected(event.target.checked ? [...options] : [])}
      >
        Subscribe to all
      </Checkbox>
      <div className="leaf-demo-row">
        {options.map((option) => (
          <Checkbox
            key={option}
            checked={selected.includes(option)}
            onChange={(event) =>
              setSelected(
                event.target.checked
                  ? [...selected, option]
                  : selected.filter((item) => item !== option),
              )
            }
          >
            {option}
          </Checkbox>
        ))}
      </div>
      <span className="leaf-demo-note">Selected {selected.length} items</span>
    </div>
  );
}
