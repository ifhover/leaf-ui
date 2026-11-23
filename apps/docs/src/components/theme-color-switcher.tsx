import { Button, ColorPicker } from '@ifhover/leaf-ui';
import { useDark } from '@rspress/core/runtime';
import { useDocsTheme } from './docs-theme';
import { useDocsLocale } from './i18n';
import { defaultThemeColor, isNeutralThemeColor, themeColorPresets } from './theme-colors';

const pickerPresetColors = themeColorPresets
  .map((preset) => preset.color)
  .filter((preset) => !isNeutralThemeColor(preset));

export function ThemeColorSwitcher() {
  const { color, setColor } = useDocsTheme();
  const { t } = useDocsLocale();
  const dark = useDark();
  const neutral = isNeutralThemeColor(color);
  const resolvedValue = neutral ? (dark ? '#f5f5f5' : '#0d0d0d') : color;
  return (
    <ColorPicker
      className={
        neutral
          ? 'leaf-docs-color-switcher leaf-docs-color-switcher--neutral'
          : 'leaf-docs-color-switcher'
      }
      aria-label={t('切换主题色', 'Change theme color')}
      title={t('切换主题色', 'Change theme color')}
      size="sm"
      value={resolvedValue}
      onChange={setColor}
      disableAlpha
      popupPlacement="bottom-end"
      popupClassName="leaf-docs-color-panel"
      presets={[
        {
          label: t('配色预设', 'Color presets'),
          colors: pickerPresetColors,
        },
      ]}
      popupRender={(content) => (
        <>
          <div className="mb-3">
            <div className="font-medium">{t('主题色', 'Theme color')}</div>
            <p className="mt-1 text-(length:--leaf-font-size-sm) text-(--leaf-color-text-muted)">
              {t('同步应用到文档和组件预览', 'Applies to the docs and component previews')}
            </p>
          </div>
          {content}
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-(--leaf-color-divider) pt-3 text-(length:--leaf-font-size-sm)">
            <Button
              size="sm"
              variant={neutral ? 'solid' : 'outline'}
              aria-pressed={neutral}
              onClick={() => setColor(neutral ? defaultThemeColor : 'neutral')}
            >
              {t('黑白单色', 'Monochrome')}
            </Button>
            <div className="flex items-center gap-2">
              <span className="font-mono text-(--leaf-color-text-muted)">
                {neutral ? 'neutral' : color.toUpperCase()}
              </span>
              <Button variant="link" size="sm" onClick={() => setColor(defaultThemeColor)}>
                {t('恢复默认', 'Reset')}
              </Button>
            </div>
          </div>
        </>
      )}
    />
  );
}
