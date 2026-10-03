import { Button, ConfigProvider } from '@sudden3/leaf-ui';
import { useId, useState } from 'react';
import { CopyButton } from './copy-button';
import { useDocsLocale } from './i18n';
import { Icon } from './icon';

export function ThemePlayground() {
  const { t } = useDocsLocale();
  const palettes = [
    { name: t('苔绿', 'Moss'), color: '#20834a' },
    { name: t('湖蓝', 'Lake'), color: '#087f8c' },
    { name: t('晴蓝', 'Sky'), color: '#3264d9' },
    { name: t('鸢紫', 'Iris'), color: '#7654c6' },
    { name: t('陶橙', 'Clay'), color: '#b75b1c' },
  ];

  const [color, setColor] = useState('#20834a');
  const [radius, setRadius] = useState(10);
  const [height, setHeight] = useState(34);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [subscribed, setSubscribed] = useState(false);
  const id = useId();
  const source = [
    "import { Button, ConfigProvider } from '@sudden3/leaf-ui';",
    '',
    '<ConfigProvider theme={{',
    `  primaryColor: '${color}',`,
    `  borderRadius: ${radius},`,
    `  controlHeight: ${height},`,
    `  appearance: '${mode}',`,
    '}}>',
    `  <Button>${t('保存', 'Save')}</Button>`,
    '</ConfigProvider>',
  ].join('\n');

  function reset() {
    setColor('#20834a');
    setRadius(10);
    setHeight(34);
    setMode('light');
    setSubscribed(false);
  }

  return (
    <div className="leaf-playground">
      <ConfigProvider
        className="leaf-playground__preview"
        theme={{
          primaryColor: color,
          borderRadius: radius,
          controlHeight: height,
          appearance: mode,
        }}
      >
        <div className="leaf-playground__preview-header">
          <span className="leaf-eyebrow">LIVE PREVIEW</span>
          <span className="leaf-preview-tag">
            <span />
            {t('实时预览', 'Live preview')}
          </span>
        </div>
        <div className="leaf-preview-card">
          <div className="leaf-preview-card__icon">
            <Icon name="leaf" width="28" height="28" />
          </div>
          <span className="leaf-preview-card__tag">LESS, BUT BETTER</span>
          <h3>{t('一点绿意，很多可能。', 'A little green. Many possibilities.')}</h3>
          <p>
            {t('从小小的交互开始，构建属于你的界面。', 'Start small and build your own interface.')}
          </p>
          <div className="leaf-preview-card__actions">
            <Button
              onClick={() => setSubscribed(!subscribed)}
              startIcon={<Icon name={subscribed ? 'check' : 'plus'} />}
              aria-pressed={subscribed}
            >
              {subscribed
                ? t('已加入项目', 'Project joined')
                : t('创建你的项目', 'Create your project')}
            </Button>
            <Button variant="outline" onClick={() => setSubscribed(false)}>
              {t('重新开始', 'Start again')}
            </Button>
          </div>
          <div className="leaf-preview-card__footer">
            <span className="leaf-preview-avatar">L</span>
            <span>{t('为下一个好想法，留一点空间。', 'Make room for the next good idea.')}</span>
            <Icon name="sparkles" width="16" height="16" />
          </div>
        </div>
        <div className="leaf-preview-variants">
          <div>
            <Button size="sm">{t('主要按钮', 'Primary')}</Button>
            <span>Solid</span>
          </div>
          <div>
            <Button size="sm" variant="soft">
              {t('柔和按钮', 'Soft')}
            </Button>
            <span>Soft</span>
          </div>
          <div>
            <Button size="sm" variant="outline">
              {t('描边按钮', 'Outline')}
            </Button>
            <span>Outline</span>
          </div>
          <div>
            <Button size="sm" variant="ghost">
              {t('文字按钮', 'Ghost')}
            </Button>
            <span>Ghost</span>
          </div>
        </div>
      </ConfigProvider>
      <div className="leaf-playground__controls">
        <div className="leaf-playground__controls-header">
          <Icon name="sliders" width="18" height="18" />
          <h3>{t('你的风格，你来定义', 'Your style, your choice')}</h3>
        </div>
        <p className="leaf-control-description">
          {t('几个设置，就能长成你喜欢的样子。', 'A few settings shape the look you want.')}
        </p>
        <fieldset className="leaf-control-fieldset">
          <legend>
            {t('主题色', 'Primary color')}
            <span>Primary color</span>
          </legend>
          <div className="leaf-color-swatches">
            {palettes.map((palette) => (
              <button
                key={palette.color}
                type="button"
                className="leaf-color-swatch"
                aria-label={t(`使用${palette.name}主题`, `Use ${palette.name} theme`)}
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
            <span className="leaf-color-input__hint">{t('自定义', 'Custom')}</span>
          </label>
        </fieldset>
        <div className="leaf-control-radius">
          <label htmlFor={`${id}-radius`}>
            {t('圆角', 'Radius')}
            <span>Border radius</span>
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
            <span>{t('利落', 'Sharp')}</span>
            <span>{t('圆润', 'Rounded')}</span>
          </div>
        </div>
        <fieldset className="leaf-control-fieldset">
          <legend>
            {t('外观', 'Appearance')}
            <span>Appearance</span>
          </legend>
          <div className="leaf-mode-toggle">
            <button type="button" aria-pressed={mode === 'light'} onClick={() => setMode('light')}>
              <Icon name="sun" width="16" height="16" />
              {t('浅色', 'Light')}
            </button>
            <button type="button" aria-pressed={mode === 'dark'} onClick={() => setMode('dark')}>
              <Icon name="moon" width="16" height="16" />
              {t('深色', 'Dark')}
            </button>
          </div>
        </fieldset>
        <div className="leaf-control-radius">
          <label htmlFor={`${id}-height`}>
            {t('控件高度', 'Control height')}
            <span>Control height</span>
            <output htmlFor={`${id}-height`}>{height}px</output>
          </label>
          <input
            id={`${id}-height`}
            type="range"
            min="28"
            max="44"
            step="1"
            value={height}
            onChange={(event) => setHeight(Number(event.target.value))}
          />
          <div>
            <span>{t('紧凑', 'Compact')}</span>
            <span>{t('宽松', 'Spacious')}</span>
          </div>
        </div>
        <div className="leaf-playground__code">
          <div>
            <span>theme.tsx</span>
            <CopyButton text={source} />
          </div>
          <pre>
            <code>{source}</code>
          </pre>
        </div>
        <Button className="leaf-playground__reset" size="sm" variant="ghost" onClick={reset}>
          {t('恢复默认', 'Reset theme')}
        </Button>
      </div>
    </div>
  );
}
