import { Button, ColorPicker } from '@ifhover/leaf-ui';
import { useDocsTheme } from './docs-theme';
import { useDocsLocale } from './i18n';
import { defaultThemeColor, themeColorPresets } from './theme-colors';

export function ThemeColorSwitcher() {
  const { color, setColor } = useDocsTheme();
  const { t } = useDocsLocale();
  return (
    <ColorPicker
      className="leaf-docs-color-switcher"
      aria-label={t('切换主题色', 'Change theme color')}
      title={t('切换主题色', 'Change theme color')}
      size="sm"
      value={color}
      onChange={setColor}
      disableAlpha
      popupPlacement="bottom-end"
      popupClassName="leaf-docs-color-panel"
      presets={[
        {
          label: t('配色预设', 'Color presets'),
          colors: themeColorPresets.map((preset) => preset.color),
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
          <div className="mt-3 flex justify-between gap-3 text-(length:--leaf-font-size-sm)">
            <span className="font-mono text-(--leaf-color-text-muted)">{color.toUpperCase()}</span>
            <Button variant="link" onClick={() => setColor(defaultThemeColor)}>
              {t('恢复默认', 'Reset color')}
            </Button>
          </div>
        </>
      )}
    />
  );
}
