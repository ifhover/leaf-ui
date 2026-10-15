import { Button, Cascader, ConfigProvider, Select, Space, Tag, TreeSelect } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = [
  {
    value: 'long',
    label: 'A very long selected label that must never push the controls outside the field',
  },
  { value: 'design', label: 'Design' },
  { value: 'code', label: 'Engineering' },
  { value: 'locked', label: 'Locked', disabled: true },
];
const values = options.map((option) => option.value);
const tree = [{ value: 'team', label: 'Team', selectable: false, children: options }];
const paths = options.map((option) => ['team', option.value]);

export function MultiSelectFixture() {
  const [width, setWidth] = useState(300);
  const [compact, setCompact] = useState(false);
  const [rtl, setRtl] = useState(false);
  return (
    <ConfigProvider
      className="browser-multi-select"
      density={compact ? 'compact' : 'comfortable'}
      direction={rtl ? 'rtl' : 'ltr'}
    >
      <h1>Multiple selections</h1>
      <Space>
        <Button onClick={() => setWidth(width === 300 ? 140 : 300)}>Resize selections</Button>
        <Button onClick={() => setCompact(!compact)}>Toggle density</Button>
        <Button onClick={() => setRtl(!rtl)}>Toggle direction</Button>
      </Space>
      <form aria-label="Selections" style={{ width, maxWidth: '100%', marginTop: 20 }}>
        <Space direction="vertical" align="stretch">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} data-size={size}>
              <Space direction="vertical" align="stretch">
                <Select
                  aria-label={`Select ${size}`}
                  name={`select-${size}`}
                  size={size}
                  multiple
                  showSearch
                  allowClear
                  tagWrap={false}
                  options={options}
                  defaultValue={values}
                />
                <TreeSelect
                  aria-label={`Tree ${size}`}
                  name={`tree-${size}`}
                  size={size}
                  treeCheckable
                  tagWrap={false}
                  options={tree}
                  defaultValue={values}
                />
                <Cascader
                  aria-label={`Cascader ${size}`}
                  name={`cascader-${size}`}
                  size={size}
                  multiple
                  showSearch
                  tagWrap={false}
                  options={tree}
                  defaultValue={paths}
                />
              </Space>
            </div>
          ))}
          <Select
            aria-label="One long value"
            multiple
            showSearch
            allowClear
            tagWrap={false}
            options={options}
            defaultValue={['long']}
          />
          <Select
            aria-label="Custom tags"
            multiple
            maxTagCount="responsive"
            options={options}
            defaultValue={values}
            tagRender={(option, remove) => (
              <Tag closable onClose={remove}>
                {option.label}
              </Tag>
            )}
          />
          <Select
            aria-label="Count only"
            multiple
            tagWrap={false}
            maxTagCount={0}
            options={options}
            defaultValue={values}
          />
          <Select
            aria-label="Wrapped selections"
            multiple
            options={options}
            defaultValue={values}
          />
          <Select
            aria-label="Read only selections"
            multiple
            tagWrap={false}
            readOnly
            options={options}
            defaultValue={values}
          />
          <TreeSelect aria-label="Single tree" options={tree} />
          <TreeSelect aria-label="Checked tree" options={tree} treeCheckable />
          <button type="reset">Reset selections</button>
        </Space>
      </form>
    </ConfigProvider>
  );
}
