import { Button, ConfigProvider, Input, Slider } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function ConfigProviderSizes() {
  const [height, setHeight] = useState(34);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div>
        <p>Base height: {height}px</p>
        <Slider
          aria-label="Base control height"
          min={28}
          max={44}
          value={height}
          onChange={setHeight}
          showValue={false}
        />
      </div>
      <ConfigProvider
        className="leaf-demo-stack"
        theme={{ controlHeight: height, borderRadius: 8 }}
      >
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="leaf-demo-control-row">
            <span className="leaf-demo-size">{size}</span>
            <Input size={size} aria-label={`${size} themed input`} placeholder="Project name" />
            <Button size={size}>Save</Button>
          </div>
        ))}
      </ConfigProvider>
      <ConfigProvider
        theme={{ controlHeight: height, tokens: { controlHeightSm: 26, borderRadiusLg: 20 } }}
      >
        <Button size="sm" variant="outline">
          Advanced override: small height stays at 26px
        </Button>
      </ConfigProvider>
    </div>
  );
}
