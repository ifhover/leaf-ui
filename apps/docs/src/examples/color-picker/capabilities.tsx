import { ColorPicker, Space } from '@sudden3/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space>
      <div>
        <p style={{ margin: '0 0 8px' }}>{english ? 'Solid color' : '纯色'}</p>
        <ColorPicker showText />
      </div>
      <div>
        <p style={{ margin: '0 0 8px' }}>
          {english ? 'Gradient: select, add or remove stops' : '渐变：选择、添加或移除色标'}
        </p>
        <ColorPicker
          mode="gradient"
          showText
          defaultValue="linear-gradient(90deg, #20834a 0%, #83cf9e 100%)"
        />
      </div>
    </Space>
  );
}
