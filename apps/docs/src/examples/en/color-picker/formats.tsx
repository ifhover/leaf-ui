import { ColorPicker } from '@sudden3/leaf-ui';
export function ColorPickerFormats() {
  return (
    <div className="leaf-demo-row">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">HEX</span>
        <ColorPicker defaultValue="#1677ff" showText />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">RGB · Transparent</span>
        <ColorPicker defaultValue="rgba(118, 84, 198, 0.6)" defaultFormat="rgb" showText />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">HSL · Opaque</span>
        <ColorPicker defaultValue="hsl(35, 91%, 55%)" defaultFormat="hsl" disableAlpha showText />
      </div>
    </div>
  );
}
