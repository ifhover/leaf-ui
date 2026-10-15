import { ColorPicker, Flex, Space, Text } from '@ifhover/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space>
      <Flex direction="column" gap="sm" align="center">
        <Text>{english ? 'Solid color' : '纯色'}</Text>
        <ColorPicker showText />
      </Flex>
      <Flex direction="column" gap="sm" align="center">
        <Text>
          {english ? 'Gradient: select, add or remove stops' : '渐变：选择、添加或移除色标'}
        </Text>
        <ColorPicker
          mode="gradient"
          showText
          defaultValue="linear-gradient(90deg, #20834a 0%, #83cf9e 100%)"
        />
      </Flex>
    </Space>
  );
}
