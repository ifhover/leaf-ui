import './color-palette.scss';
import { type CSSProperties, useMemo, useState } from 'react';
import { type ColorScaleStep, colorScaleSteps } from '../../../../packages/react/src/color-scale';
import {
  type ColorShadeStep,
  semanticColorShadeSteps,
} from '../../../../packages/react/src/color-shades';
import { type colorSeeds, resolveColorRoles } from '../../../../packages/react/src/colors';
import { useLeafConfig } from '../../../../packages/react/src/config-provider/context';
import { leafThemeColors } from '../../../../packages/react/src/theme';
import { useDocsLocale } from './i18n';

const semanticFamilies = [
  ['primary', '主题色', 'Primary'],
  ['success', '成功色', 'Success'],
  ['danger', '危险色', 'Danger'],
  ['warning', '警告色', 'Warning'],
  ['info', '信息色', 'Info'],
] as const;

type ColorFamily = keyof typeof colorSeeds;
type ColorStep = ColorShadeStep | ColorScaleStep;

function ScaleRow({
  family,
  label,
  values,
  english,
}: {
  family: ColorFamily;
  label: string;
  values: Record<string, string>;
  english: boolean;
}) {
  const neutral = family === 'neutral';
  const steps: readonly ColorStep[] = neutral ? colorScaleSteps : semanticColorShadeSteps;
  const [selected, setSelected] = useState<ColorStep>(neutral ? 500 : 'light-3');
  const variable = `--leaf-color-${family}-${selected}`;
  const base = values[`--leaf-color-${family}`];
  return (
    <section
      className="leaf-color-scale"
      aria-label={label}
      data-family={family}
      style={{ '--leaf-color-scale-columns': steps.length } as CSSProperties}
    >
      <header className="leaf-color-scale__heading">
        <h3>{label}</h3>
        <span className="leaf-color-scale__base-key">
          <span style={{ backgroundColor: base }} aria-hidden="true" />
          {english ? 'Base' : '基色'} <code>{base}</code>
        </span>
        <code className="leaf-color-scale__base-variable">{`--leaf-color-${family}`}</code>
      </header>
      <div className="leaf-color-scale__track">
        {steps.map((step) => {
          const name = `--leaf-color-${family}-${step}`;
          return (
            <button
              type="button"
              className="leaf-color-scale__swatch"
              key={step}
              data-selected={selected === step}
              aria-pressed={selected === step}
              aria-label={`${label} ${step}: ${values[name]}`}
              onClick={() => setSelected(step)}
            >
              <span className="leaf-color-scale__paint" style={{ backgroundColor: values[name] }} />
              <span className="leaf-color-scale__step">{step}</span>
            </button>
          );
        })}
      </div>
      <div className="leaf-color-scale__selection" aria-live="polite">
        <code>{variable}</code>
        <code>{values[variable]}</code>
      </div>
    </section>
  );
}

export function ColorPalette() {
  const { english } = useDocsLocale();
  const { theme } = useLeafConfig();
  const { values } = useMemo(
    () => resolveColorRoles(theme.appearance ?? 'light', leafThemeColors(theme)),
    [theme],
  );
  return (
    <div className="leaf-color-scales rp-not-doc">
      <div className="leaf-color-scale-list">
        {semanticFamilies.map(([family, zh, en]) => (
          <ScaleRow
            key={family}
            family={family}
            label={english ? en : zh}
            values={values}
            english={english}
          />
        ))}
        <ScaleRow
          family="neutral"
          label={english ? 'Neutral' : '中性色'}
          values={values}
          english={english}
        />
      </div>
    </div>
  );
}
