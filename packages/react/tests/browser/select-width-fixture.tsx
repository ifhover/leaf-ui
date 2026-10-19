import { ConfigProvider, Select, type SelectProps, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';

const shortOptions = [{ value: 'leaf', label: 'Leaf' }];
const longOptions = [
  {
    value: 'long',
    label:
      'A long provider name with enough detail to exceed the previous 420 pixel popup width limit',
  },
];

export function SelectWidthFixture() {
  const [mode, setMode] = useState<SelectProps['popupWidth']>('auto');
  return (
    <>
      <h1>Select popup widths</h1>
      <Space direction="vertical" align="start">
        <Select aria-label="Default short" options={shortOptions} style={{ width: 560 }} />
        <Select aria-label="Default long" options={longOptions} style={{ width: 560 }} />
        <Select
          aria-label="Content short"
          options={shortOptions}
          popupWidth="auto"
          style={{ width: 560 }}
        />
        <Select
          aria-label="Content long"
          options={longOptions}
          popupWidth="auto"
          style={{ width: 180 }}
        />
        <Select
          aria-label="Fixed width"
          options={shortOptions}
          popupWidth={560}
          style={{ width: 180 }}
        />
        <Select
          aria-label="CSS width"
          options={shortOptions}
          popupWidth="32rem"
          style={{ width: 180 }}
        />
        {(['trigger', 'auto', 560] as const).map((width) => (
          <Select
            key={width}
            aria-label={`Limited ${width}`}
            options={longOptions}
            popupWidth={width}
            popupMaxWidth={240}
            style={{ width: 560 }}
          />
        ))}
        <Select
          aria-label="Style maximum"
          options={longOptions}
          popupStyle={{ maxWidth: 260 }}
          style={{ width: 560 }}
        />
        <Select
          aria-label="Changing width"
          options={shortOptions}
          popupWidth={mode}
          style={{ width: 560 }}
        />
        <button type="button" onClick={() => setMode('trigger')}>
          Match trigger
        </button>
        <button type="button" onClick={() => setMode(300)}>
          Use fixed width
        </button>
        <button type="button" onClick={() => setMode('auto')}>
          Fit content
        </button>
        <ConfigProvider components={{ Select: { popupWidth: 'auto', popupMaxWidth: 480 } }}>
          <Select aria-label="Regional width" options={longOptions} style={{ width: 180 }} />
          <Select
            aria-label="Instance width"
            options={longOptions}
            popupWidth="trigger"
            style={{ width: 180 }}
          />
        </ConfigProvider>
      </Space>
    </>
  );
}
