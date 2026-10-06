import { CodeBlockRuntime } from '@rspress/core/theme-original';
import {
  Avatar,
  Badge,
  Button,
  Card,
  ColorPicker,
  ConfigProvider,
  Progress,
  RadioGroup,
  Slider,
  Switch,
} from '@sudden3/leaf-ui';
import { useId, useState } from 'react';
import { CopyButton } from './copy-button';
import { useDocsLocale } from './i18n';
import { Icon } from './icon';
import { defaultThemeColor, normalizeThemeColor, themeColorPresets } from './theme-colors';

export function ThemePlayground() {
  const { t } = useDocsLocale();
  const [color, setColor] = useState<string>(defaultThemeColor);
  const [radius, setRadius] = useState(10);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [showCode, setShowCode] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [motion, setMotion] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [priority, setPriority] = useState(64);
  const id = useId();
  const source = [
    "import { Button, ConfigProvider } from '@sudden3/leaf-ui';",
    '',
    `<ConfigProvider density="${density}" theme={{`,
    `  primaryColor: '${color}',`,
    `  borderRadius: ${radius},`,
    `  appearance: '${mode}',`,
    `  motion: ${motion},`,
    "  tokens: { onPrimaryColor: '#fff' },",
    '}}>',
    `  <Button>${t('保存', 'Save')}</Button>`,
    '</ConfigProvider>',
  ].join('\n');

  function reset() {
    setColor(defaultThemeColor);
    setRadius(10);
    setMode('light');
    setDensity('comfortable');
    setSubscribed(false);
    setMotion(true);
    setReminders(true);
    setPriority(64);
  }

  return (
    <div className="leaf-playground">
      <ConfigProvider
        className="leaf-playground__preview"
        density={density}
        theme={{
          primaryColor: color,
          borderRadius: radius,
          appearance: mode,
          motion,
          tokens: { onPrimaryColor: '#fff' },
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
            icon={<Icon name="sliders" width="25" height="25" />}
          />
          <span className="leaf-preview-card__tag">YOUR WORKSPACE</span>
          <h3>{t('找到适合你的节奏。', 'Find your own rhythm.')}</h3>
          <p>
            {t('从小小的交互开始，构建属于你的界面。', 'Start small and build your own interface.')}
          </p>
          <div className="leaf-preview-card__preferences">
            <div>
              <span>{t('项目提醒', 'Project reminders')}</span>
              <Switch
                checked={reminders}
                onChange={(event) => setReminders(event.target.checked)}
                aria-label={t('项目提醒', 'Project reminders')}
              />
            </div>
            <Slider
              value={priority}
              onChange={setPriority}
              showValue={false}
              aria-label={t('优先级', 'Priority')}
            />
            <Progress
              percent={priority}
              showInfo={false}
              aria-label={t('优先级进度', 'Priority progress')}
            />
          </div>
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
              {t('灰底按钮', 'Neutral')}
            </Button>
            <span>Neutral</span>
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
          <Button className="leaf-playground__reset" size="sm" variant="ghost" onClick={reset}>
            {t('重置', 'Reset')}
          </Button>
        </div>
        <p className="leaf-control-description">
          {t('几个设置，就能长成你喜欢的样子。', 'A few settings shape the look you want.')}
        </p>
        <fieldset className="leaf-control-fieldset">
          <legend>{t('密度', 'Density')}</legend>
          <RadioGroup
            aria-label={t('密度', 'Density')}
            value={density}
            options={[
              { value: 'comfortable', label: t('舒适', 'Comfortable') },
              { value: 'compact', label: t('紧凑', 'Compact') },
            ]}
            onChange={(event) =>
              setDensity(event.target.value === 'compact' ? 'compact' : 'comfortable')
            }
          />
        </fieldset>
        <fieldset className="leaf-control-fieldset">
          <legend>
            {t('主题色', 'Primary color')}
            <span>Primary color</span>
          </legend>
          <fieldset
            className="leaf-playground__palettes"
            aria-label={t('配色预设', 'Color presets')}
          >
            {themeColorPresets.map((palette) => {
              const selected = color.toLowerCase() === palette.color;
              return (
                <button
                  key={palette.color}
                  type="button"
                  className="leaf-playground__swatch"
                  style={{
                    backgroundColor: palette.color,
                  }}
                  aria-label={t(palette.zh, palette.en)}
                  aria-pressed={selected}
                  title={`${t(palette.zh, palette.en)} ${palette.color.toUpperCase()}`}
                  onClick={() => setColor(palette.color)}
                >
                  {selected && <Icon name="check" width="16" height="16" />}
                </button>
              );
            })}
          </fieldset>
          <ColorPicker
            className="leaf-playground__color-picker"
            aria-label={t('主题色', 'Primary color')}
            value={color}
            onChange={(value) => setColor(normalizeThemeColor(value))}
            showText={(value) => value.toUpperCase()}
            presets={[
              {
                label: t('配色预设', 'Color presets'),
                colors: themeColorPresets.map((preset) => preset.color),
              },
            ]}
            disableAlpha
          />
        </fieldset>
        <div className="leaf-control-motion">
          <span>{t('交互动效', 'Interaction motion')}</span>
          <Switch
            size="sm"
            checked={motion}
            onChange={(event) => setMotion(event.target.checked)}
            aria-label={t('交互动效', 'Interaction motion')}
          />
        </div>
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
      </div>
      <div className="leaf-playground__code">
        <div className="leaf-playground__code-header">
          <Button
            className="leaf-playground__code-toggle"
            size="sm"
            variant="ghost"
            startIcon={<Icon name="code" width="15" height="15" />}
            endIcon={<Icon name="chevron" width="14" height="14" />}
            aria-expanded={showCode}
            aria-controls={`${id}-code`}
            onClick={() => setShowCode(!showCode)}
          >
            {t('主题代码', 'Theme code')}
          </Button>
          <span>theme.tsx</span>
          <CopyButton text={source} label={t('复制代码', 'Copy code')} />
        </div>
        <div id={`${id}-code`} hidden={!showCode}>
          {showCode && <CodeBlockRuntime lang="tsx" code={source} />}
        </div>
      </div>
    </div>
  );
}
