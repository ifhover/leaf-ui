import { Button, type LeafThemeStyle } from '@sudden3/leaf-ui';
import { useId, useState } from 'react';
import { CopyButton } from './copy-button';
import { Icon } from './icon';

const palettes = [
  { name: '苔绿', color: '#20834a' },
  { name: '湖蓝', color: '#087f8c' },
  { name: '晴蓝', color: '#3264d9' },
  { name: '鸢紫', color: '#7654c6' },
  { name: '陶橙', color: '#b75b1c' },
];

export function ThemePlayground() {
  const [color, setColor] = useState('#20834a');
  const [radius, setRadius] = useState(10);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [subscribed, setSubscribed] = useState(false);
  const id = useId();
  const themeColor = mode === 'dark' ? `color-mix(in srgb, ${color} 65%, white)` : color;
  const style: LeafThemeStyle = {
    '--leaf-color-primary': themeColor,
    '--leaf-color-on-primary': mode === 'dark' ? '#11271a' : '#ffffff',
    '--leaf-radius': `${radius}px`,
  };
  const css = [
    ':root {',
    `  --leaf-color-primary: ${themeColor};`,
    `  --leaf-radius: ${radius}px;`,
    mode === 'dark' ? '  --leaf-color-on-primary: #11271a;' : '',
    '}',
  ]
    .filter(Boolean)
    .join('\n');

  function reset() {
    setColor('#20834a');
    setRadius(10);
    setMode('light');
    setSubscribed(false);
  }

  return (
    <div className="leaf-playground">
      <div className="leaf-playground__preview" data-leaf-theme={mode} style={style}>
        <div className="leaf-playground__preview-header">
          <span className="leaf-eyebrow">LIVE PREVIEW</span>
          <span className="leaf-preview-tag">
            <span />
            实时预览
          </span>
        </div>
        <div className="leaf-preview-card">
          <div className="leaf-preview-card__icon">
            <Icon name="leaf" width="28" height="28" />
          </div>
          <span className="leaf-preview-card__tag">LESS, BUT BETTER</span>
          <h3>一点绿意，很多可能。</h3>
          <p>从小小的交互开始，构建属于你的界面。</p>
          <div className="leaf-preview-card__actions">
            <Button
              onClick={() => setSubscribed(!subscribed)}
              startIcon={<Icon name={subscribed ? 'check' : 'plus'} />}
              aria-pressed={subscribed}
            >
              {subscribed ? '已加入项目' : '创建你的项目'}
            </Button>
            <Button variant="outline" onClick={() => setSubscribed(false)}>
              重新开始
            </Button>
          </div>
          <div className="leaf-preview-card__footer">
            <span className="leaf-avatar">L</span>
            <span>为下一个好想法，留一点空间。</span>
            <Icon name="sparkles" width="16" height="16" />
          </div>
        </div>
        <div className="leaf-preview-variants">
          <div>
            <Button size="sm">主要按钮</Button>
            <span>Solid</span>
          </div>
          <div>
            <Button size="sm" variant="soft">
              柔和按钮
            </Button>
            <span>Soft</span>
          </div>
          <div>
            <Button size="sm" variant="outline">
              描边按钮
            </Button>
            <span>Outline</span>
          </div>
          <div>
            <Button size="sm" variant="ghost">
              文字按钮
            </Button>
            <span>Ghost</span>
          </div>
        </div>
      </div>
      <div className="leaf-playground__controls">
        <div className="leaf-playground__controls-header">
          <Icon name="sliders" width="18" height="18" />
          <h3>你的风格，你来定义</h3>
        </div>
        <p className="leaf-control-description">几个变量，就能长成你喜欢的样子。</p>
        <fieldset className="leaf-control-fieldset">
          <legend>
            主题色 <span>Primary color</span>
          </legend>
          <div className="leaf-color-swatches">
            {palettes.map((palette) => (
              <button
                key={palette.color}
                type="button"
                className="leaf-color-swatch"
                aria-label={`使用${palette.name}主题`}
                aria-pressed={color === palette.color}
                title={palette.name}
                onClick={() => setColor(palette.color)}
                style={{ backgroundColor: palette.color }}
              >
                {color === palette.color && <Icon name="check" width="18" height="18" />}
              </button>
            ))}
          </div>
          <label className="leaf-color-input" htmlFor={`${id}-color`}>
            <input
              id={`${id}-color`}
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
            />
            <span>{color.toUpperCase()}</span>
            <span className="leaf-color-input__hint">自定义</span>
          </label>
        </fieldset>
        <div className="leaf-control-radius">
          <label htmlFor={`${id}-radius`}>
            圆角 <span>Border radius</span>
            <output htmlFor={`${id}-radius`}>{radius}px</output>
          </label>
          <input
            id={`${id}-radius`}
            type="range"
            min="0"
            max="24"
            step="1"
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
          />
          <div>
            <span>利落</span>
            <span>圆润</span>
          </div>
        </div>
        <fieldset className="leaf-control-fieldset">
          <legend>
            外观 <span>Appearance</span>
          </legend>
          <div className="leaf-mode-toggle">
            <button type="button" aria-pressed={mode === 'light'} onClick={() => setMode('light')}>
              <Icon name="sun" width="16" height="16" />
              浅色
            </button>
            <button type="button" aria-pressed={mode === 'dark'} onClick={() => setMode('dark')}>
              <Icon name="moon" width="16" height="16" />
              深色
            </button>
          </div>
        </fieldset>
        <div className="leaf-playground__code">
          <div>
            <span>theme.css</span>
            <CopyButton text={css} />
          </div>
          <pre>
            <code>{css}</code>
          </pre>
        </div>
        <Button className="leaf-playground__reset" size="sm" variant="ghost" onClick={reset}>
          恢复默认
        </Button>
      </div>
    </div>
  );
}
