import {
  Avatar,
  Badge,
  Button,
  Card,
  ColorPicker,
  ConfigProvider,
  RadioGroup,
  Slider,
} from '@sudden3/leaf-ui';
import { useId, useState } from 'react';
import { CopyButton } from './copy-button';
import { useDocsLocale } from './i18n';
import { Icon } from './icon';

export function ThemePlayground() {
  const { t } = useDocsLocale();
  const palettes = ['#20834a', '#087f8c', '#3264d9', '#7654c6', '#b75b1c'];

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
          <Badge
            status="success"
            color="var(--leaf-color-primary)"
            text={t('实时预览', 'Live preview')}
          />
        </div>
        <Card
          className="leaf-preview-card"
          footer={
            <div className="leaf-preview-card__footer">
              <Avatar size={24} alt="Leaf UI">
                L
              </Avatar>
              <span>{t('为下一个好想法，留一点空间。', 'Make room for the next good idea.')}</span>
              <Icon name="sparkles" width="16" height="16" />
            </div>
          }
        >
          <Avatar
            className="leaf-preview-card__icon"
            size={48}
            shape="square"
            alt={t('叶子', 'Leaf')}
            icon={<Icon name="leaf" width="28" height="28" />}
          />
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
        </Card>
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
          <ColorPicker
            className="leaf-playground__color-picker"
            aria-label={t('主题色', 'Primary color')}
            value={color}
            onChange={setColor}
            showText={(value) => value.toUpperCase()}
            disableAlpha
            presets={[{ label: t('推荐配色', 'Suggested colors'), colors: palettes }]}
          />
        </fieldset>
        <div className="leaf-control-radius">
          <label htmlFor={`${id}-radius`}>
            {t('圆角', 'Radius')}
            <span>Border radius</span>
            <output htmlFor={`${id}-radius`}>{radius}px</output>
          </label>
          <Slider
            id={`${id}-radius`}
            aria-label={t('圆角', 'Radius')}
            min={0}
            max={24}
            value={radius}
            onChange={setRadius}
            showValue={false}
          />
          <div className="leaf-control-hints">
            <span>{t('利落', 'Sharp')}</span>
            <span>{t('圆润', 'Rounded')}</span>
          </div>
        </div>
        <fieldset className="leaf-control-fieldset">
          <legend>
            {t('外观', 'Appearance')}
            <span>Appearance</span>
          </legend>
          <RadioGroup
            aria-label={t('外观', 'Appearance')}
            size="sm"
            value={mode}
            options={[
              { label: t('浅色', 'Light'), value: 'light' },
              { label: t('深色', 'Dark'), value: 'dark' },
            ]}
            onChange={(event) => {
              if (event.target.value === 'light' || event.target.value === 'dark') {
                setMode(event.target.value);
              }
            }}
          />
        </fieldset>
        <div className="leaf-control-radius">
          <label htmlFor={`${id}-height`}>
            {t('控件高度', 'Control height')}
            <span>Control height</span>
            <output htmlFor={`${id}-height`}>{height}px</output>
          </label>
          <Slider
            id={`${id}-height`}
            aria-label={t('控件高度', 'Control height')}
            min={28}
            max={44}
            value={height}
            onChange={setHeight}
            showValue={false}
          />
          <div className="leaf-control-hints">
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
