import { Flex, Slider, Space, Text } from '@ifhover/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm" align="center">
        <Text>
          {english ? 'Discrete marks with formatted tooltip' : '只选择指定刻度与自定义提示'}
        </Text>
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
      </Flex>
    </Space>
  );
}
