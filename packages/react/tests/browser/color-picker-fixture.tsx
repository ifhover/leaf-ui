import { ColorPicker } from '@ifhover/leaf-ui';

export function ColorPickerFixture() {
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: '100%' }}>
      {(['hex', 'rgb', 'hsl'] as const).map((format) => (
        <ColorPicker
          key={format}
          aria-label={`${format} color`}
          defaultFormat={format}
          defaultValue="rgba(128, 128, 128, 0.1)"
          showText
          allowClear
        />
      ))}
      <ColorPicker aria-label="swatch color" size="sm" />
      <ColorPicker aria-label="gradient color" mode="gradient" showText />
      <ColorPicker aria-label="narrow gradient color" mode="gradient" popupWidth={240} showText />
      <ColorPicker aria-label="wide solid color" showText style={{ width: '100%' }} />
      <ColorPicker
        aria-label="wide gradient color"
        mode="gradient"
        showText
        style={{ width: '100%' }}
      />
      <ColorPicker aria-label="custom width color" format="rgb" showText style={{ width: 200 }} />
      <div style={{ width: 180 }}>
        <ColorPicker aria-label="constrained color" format="hsl" showText />
      </div>
    </div>
  );
}
