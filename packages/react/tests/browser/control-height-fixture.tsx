import {
  AutoComplete,
  Button,
  Cascader,
  Checkbox,
  ColorPicker,
  DatePicker,
  DateRangePicker,
  Input,
  InputNumber,
  InputOTP,
  Radio,
  Select,
  Space,
  Switch,
  Tabs,
  Transfer,
  TreeSelect,
} from '@ifhover/leaf-ui';

const options = Array.from({ length: 120 }, (_, index) => ({
  value: String(index),
  label: `Option ${index}`,
}));

export function ControlHeightFixture() {
  return (
    <Space direction="vertical" align="stretch" size={24} style={{ maxWidth: 480 }}>
      <h1>Shared control height</h1>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Space key={size} direction="vertical" align="stretch" data-testid={`controls-${size}`}>
          <h2>{size}</h2>
          <div data-height-control="Button">
            <Button size={size}>Action</Button>
          </div>
          <div data-height-control="Input">
            <Input size={size} aria-label={`Input ${size}`} />
          </div>
          <div data-height-control="InputNumber">
            <InputNumber size={size} aria-label={`Number ${size}`} />
          </div>
          <div data-height-control="InputOTP">
            <InputOTP size={size} length={4} />
          </div>
          <div data-height-control="Select">
            <Select size={size} aria-label={`Select ${size}`} options={options} virtual />
          </div>
          <div data-height-control="AutoComplete">
            <AutoComplete
              size={size}
              aria-label={`AutoComplete ${size}`}
              options={options}
              filterOption={false}
              virtual
            />
          </div>
          <div data-height-control="Cascader">
            <Cascader size={size} aria-label={`Cascader ${size}`} options={options} />
          </div>
          <div data-height-control="TreeSelect">
            <TreeSelect size={size} aria-label={`TreeSelect ${size}`} options={options} virtual />
          </div>
          <div data-height-control="DatePicker">
            <DatePicker size={size} aria-label={`Date ${size}`} />
          </div>
          <div data-height-control="DatePicker">
            <DatePicker picker="datetime" size={size} aria-label={`Date time ${size}`} />
          </div>
          <div data-height-control="DateRangePicker">
            <DateRangePicker size={size} aria-label={`Date range ${size}`} />
          </div>
          <div data-height-control="DatePicker">
            <DatePicker picker="time" size={size} aria-label={`Time ${size}`} />
          </div>
          <div data-height-control="DateRangePicker">
            <DateRangePicker picker="time" size={size} aria-label={`Time range ${size}`} />
          </div>
          <div data-height-control="ColorPicker">
            <ColorPicker size={size} showText />
          </div>
          <div data-height-control="Checkbox">
            <Checkbox size={size}>Choice</Checkbox>
          </div>
          <div data-height-control="Radio">
            <Radio size={size}>Choice</Radio>
          </div>
          <div data-height-control="Switch">
            <Switch size={size}>Setting</Switch>
          </div>
          <div data-height-control="Tabs">
            <Tabs
              size={size}
              type="card"
              items={[
                { key: 'one', label: 'One', children: null },
                { key: 'two', label: 'Two', children: null },
              ]}
            />
          </div>
        </Space>
      ))}
      <Transfer
        virtual
        items={options.map((option) => ({ key: option.value, label: option.label }))}
      />
    </Space>
  );
}
