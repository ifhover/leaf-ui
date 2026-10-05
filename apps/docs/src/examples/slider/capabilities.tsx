import { Slider, Space } from '@sudden3/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <div>
        <p style={{ margin: '0 0 8px' }}>
          {english ? 'Discrete marks with formatted tooltip' : '只选择指定刻度与自定义提示'}
        </p>
        <Slider
          defaultValue={25}
          step={null}
          marks={[
            { value: 0, label: '0' },
            { value: 25, label: '25' },
            { value: 60, label: '60' },
            { value: 100, label: '100' },
          ]}
          tooltip={{ formatter: (value) => `${value}%` }}
        />
      </div>
    </Space>
  );
}
