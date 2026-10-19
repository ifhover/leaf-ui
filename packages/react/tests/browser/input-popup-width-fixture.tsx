import { AutoComplete, Cascader, Mentions, TreeSelect } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputPopupWidthFixture() {
  const kind = new URLSearchParams(location.search).get('component');
  const [popupWidth, setWidth] = useState<number | string>();
  const [popupMaxWidth, setMaximum] = useState<number>();
  const [long, setLong] = useState(false);
  const label = long
    ? 'A provider with a sufficiently detailed descriptive name to grow beyond the old 420 pixel limit'
    : 'Leaf';
  const props = {
    'aria-label': 'Width field',
    style: { width: 560 },
    popupWidth,
    popupMaxWidth,
    options: [{ value: 'leaf', label }],
  };
  return (
    <>
      <h1>{kind} popup width</h1>
      {kind === 'autocomplete' ? (
        <AutoComplete {...props} filterOption={false} />
      ) : kind === 'tree' ? (
        <TreeSelect {...props} showSearch={false} />
      ) : kind === 'mentions' ? (
        <Mentions {...props} />
      ) : (
        <Cascader {...props} />
      )}
      <div>
        <button type="button" onClick={() => setWidth('auto')}>
          Fit content
        </button>
        <button type="button" onClick={() => setLong(true)}>
          Use long label
        </button>
        <button type="button" onClick={() => setWidth(500)}>
          Fix width
        </button>
        <button type="button" onClick={() => setMaximum(240)}>
          Limit width
        </button>
        <button
          type="button"
          onClick={() => {
            setWidth('trigger');
            setMaximum(undefined);
          }}
        >
          Restore default
        </button>
      </div>
    </>
  );
}
