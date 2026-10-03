import { Button, ConfigProvider, Input } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function ConfigProviderSizes() {
  const [height, setHeight] = useState(34);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <label>
        基础高度：{height}px
        <input
          aria-label="基础控件高度"
          type="range"
          min="28"
          max="44"
          value={height}
          onChange={(event) => setHeight(Number(event.target.value))}
        />
      </label>
      <ConfigProvider
        className="leaf-demo-stack"
        theme={{ controlHeight: height, borderRadius: 8 }}
      >
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="leaf-demo-control-row">
            <span className="leaf-demo-size">{size}</span>
            <Input size={size} aria-label={`${size} 主题输入框`} placeholder="项目名称" />
            <Button size={size}>保存</Button>
          </div>
        ))}
      </ConfigProvider>
      <ConfigProvider
        theme={{ controlHeight: height, tokens: { controlHeightSm: 26, borderRadiusLg: 20 } }}
      >
        <Button size="sm" variant="outline">
          高级覆盖：小尺寸固定为 26px
        </Button>
      </ConfigProvider>
    </div>
  );
}
