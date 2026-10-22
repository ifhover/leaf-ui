// biome-ignore-all lint/a11y/noNoninteractiveTabindex: Horizontal scroll regions need keyboard focus.
import './color-palette.scss';
import { colorRecipes } from '../../../../packages/react/src/color-recipes';
import { defaultColors, deriveColors } from '../../../../packages/react/src/colors';
import { useDocsLocale } from './i18n';

type SemanticFamily = 'primary' | 'success' | 'danger' | 'warning' | 'info';
type NeutralGroup = 'background' | 'text' | 'border';

export type ColorFamily = 'base' | SemanticFamily | 'neutral' | 'all';

type Appearance = 'light' | 'dark';
type ScaleCategory = 'surface' | 'border' | 'text' | 'alpha' | 'white' | 'auxiliary' | 'state';
type PaletteValues = Record<string, string>;

interface CoreColorItem {
  variable: string;
  zh: string;
  en: string;
  zhDescription: string;
  enDescription: string;
}

interface DerivedColorItem {
  variable: string;
  slug: string;
  category: ScaleCategory;
}

interface RoleColorItem {
  variable: string;
  zh: string;
  en: string;
}

interface NeutralColorItem {
  variable: string;
  zh: string;
  en: string;
  light: string;
  dark: string;
  alias?: string;
}

interface PaletteEntry {
  variable: string;
  light: string;
  dark: string;
}

const coreColorItems: CoreColorItem[] = [
  {
    variable: '--leaf-color-primary',
    zh: '主题色',
    en: 'Primary',
    zhDescription: '主要操作、链接与选中强调。',
    enDescription: 'Primary actions, links and selected emphasis.',
  },
  {
    variable: '--leaf-color-success',
    zh: '成功色',
    en: 'Success',
    zhDescription: '成功结果与正向状态。',
    enDescription: 'Successful outcomes and positive states.',
  },
  {
    variable: '--leaf-color-danger',
    zh: '危险色',
    en: 'Danger',
    zhDescription: '错误、删除与危险操作。',
    enDescription: 'Errors, deletion and destructive actions.',
  },
  {
    variable: '--leaf-color-warning',
    zh: '警告色',
    en: 'Warning',
    zhDescription: '需要留意的状态。',
    enDescription: 'States that need attention.',
  },
  {
    variable: '--leaf-color-info',
    zh: '信息色',
    en: 'Info',
    zhDescription: '提示与普通说明。',
    enDescription: 'Tips and general information.',
  },
  {
    variable: '--leaf-color-on-primary',
    zh: '主题前景',
    en: 'On primary',
    zhDescription: '实色主题背景上的内容。',
    enDescription: 'Content on solid primary fills.',
  },
  {
    variable: '--leaf-color-on-success',
    zh: '成功前景',
    en: 'On success',
    zhDescription: '实色成功背景上的内容。',
    enDescription: 'Content on solid success fills.',
  },
  {
    variable: '--leaf-color-on-danger',
    zh: '危险前景',
    en: 'On danger',
    zhDescription: '实色危险背景上的内容。',
    enDescription: 'Content on solid danger fills.',
  },
  {
    variable: '--leaf-color-on-warning',
    zh: '警告前景',
    en: 'On warning',
    zhDescription: '实色警告背景上的内容。',
    enDescription: 'Content on solid warning fills.',
  },
  {
    variable: '--leaf-color-on-info',
    zh: '信息前景',
    en: 'On info',
    zhDescription: '实色信息背景上的内容。',
    enDescription: 'Content on solid info fills.',
  },
];

const baseVariables = new Set(coreColorItems.map((item) => item.variable));

const semanticFamilyConfig: Record<
  SemanticFamily,
  {
    prefix: string;
    zh: string;
    en: string;
    zhDescription: string;
    enDescription: string;
  }
> = {
  primary: {
    prefix: '--leaf-color-primary-',
    zh: '主题色',
    en: 'Primary',
    zhDescription: '主题色派生出的文字、表面、边框与交互状态。',
    enDescription: 'Text, surfaces, borders and interaction states derived from primary.',
  },
  success: {
    prefix: '--leaf-color-success-',
    zh: '成功色',
    en: 'Success',
    zhDescription: '成功状态的背景、边框、文字与透明度。',
    enDescription: 'Success backgrounds, borders, text and alpha values.',
  },
  danger: {
    prefix: '--leaf-color-danger-',
    zh: '危险色',
    en: 'Danger',
    zhDescription: '危险操作的背景、边框、文字与交互状态。',
    enDescription: 'Danger backgrounds, borders, text and interaction states.',
  },
  warning: {
    prefix: '--leaf-color-warning-',
    zh: '警告色',
    en: 'Warning',
    zhDescription: '警告状态的背景、边框、文字与透明度。',
    enDescription: 'Warning backgrounds, borders, text and alpha values.',
  },
  info: {
    prefix: '--leaf-color-info-',
    zh: '信息色',
    en: 'Info',
    zhDescription: '信息状态的背景、边框、文字与透明度。',
    enDescription: 'Info backgrounds, borders, text and alpha values.',
  },
};

const semanticFamilies: SemanticFamily[] = ['primary', 'success', 'danger', 'warning', 'info'];

const semanticRoleItems: Record<SemanticFamily, RoleColorItem[]> = {
  primary: [
    { variable: '--leaf-color-primary-ink', zh: '主色文字', en: 'Primary ink' },
    { variable: '--leaf-color-primary-indicator', zh: '选中指示', en: 'Selected indicator' },
    { variable: '--leaf-color-primary-focus', zh: '焦点', en: 'Focus' },
    { variable: '--leaf-color-primary-hover', zh: '悬停', en: 'Hover' },
    { variable: '--leaf-color-primary-active', zh: '按下', en: 'Active' },
    { variable: '--leaf-color-primary-fill-border', zh: '实色边界', en: 'Solid fill border' },
    { variable: '--leaf-color-primary-surface-8', zh: '浅色背景', en: 'Tinted background' },
    { variable: '--leaf-color-primary-border-24', zh: '浅色边框', en: 'Tinted border' },
  ],
  success: [
    { variable: '--leaf-color-success-ink', zh: '状态文字', en: 'State text' },

    { variable: '--leaf-color-success-surface-8', zh: '浅色背景', en: 'Tinted background' },
    { variable: '--leaf-color-success-border-12', zh: '浅色边框', en: 'Tinted border' },
    { variable: '--leaf-color-success-alpha-10', zh: '透明反馈', en: 'Alpha feedback' },
    { variable: '--leaf-color-on-success', zh: '实色前景', en: 'On solid fill' },
  ],
  danger: [
    { variable: '--leaf-color-danger-ink', zh: '状态文字', en: 'State text' },

    { variable: '--leaf-color-danger-surface-8', zh: '浅色背景', en: 'Tinted background' },
    { variable: '--leaf-color-danger-border-12', zh: '浅色边框', en: 'Tinted border' },
    { variable: '--leaf-color-danger-alpha-10', zh: '透明反馈', en: 'Alpha feedback' },
    { variable: '--leaf-color-danger-hover', zh: '悬停', en: 'Hover' },
    { variable: '--leaf-color-danger-active', zh: '按下', en: 'Active' },
    { variable: '--leaf-color-on-danger', zh: '实色前景', en: 'On solid fill' },
  ],
  warning: [
    { variable: '--leaf-color-warning-ink', zh: '状态文字', en: 'State text' },

    { variable: '--leaf-color-warning-surface-8', zh: '浅色背景', en: 'Tinted background' },
    { variable: '--leaf-color-warning-border-12', zh: '浅色边框', en: 'Tinted border' },
    { variable: '--leaf-color-warning-alpha-10', zh: '透明反馈', en: 'Alpha feedback' },
    { variable: '--leaf-color-on-warning', zh: '实色前景', en: 'On solid fill' },
  ],
  info: [
    { variable: '--leaf-color-info-ink', zh: '状态文字', en: 'State text' },

    { variable: '--leaf-color-info-surface-8', zh: '浅色背景', en: 'Tinted background' },
    { variable: '--leaf-color-info-border-12', zh: '浅色边框', en: 'Tinted border' },
    { variable: '--leaf-color-info-alpha-10', zh: '透明反馈', en: 'Alpha feedback' },
    { variable: '--leaf-color-on-info', zh: '实色前景', en: 'On solid fill' },
  ],
};

const neutralGroupConfig: Record<
  NeutralGroup,
  { zh: string; en: string; zhDescription: string; enDescription: string }
> = {
  background: {
    zh: '背景',
    en: 'Background',
    zhDescription: '页面、表面与柔和反馈。',
    enDescription: 'Pages, surfaces and quiet feedback.',
  },
  text: {
    zh: '文字',
    en: 'Text',
    zhDescription: '正文、说明与低层级文字。',
    enDescription: 'Body copy, supporting text and lower-emphasis text.',
  },
  border: {
    zh: '边框',
    en: 'Border',
    zhDescription: '边框、分隔线与描边。',
    enDescription: 'Borders, dividers and outlines.',
  },
};

const neutralGroups: NeutralGroup[] = ['background', 'text', 'border'];

const neutralLabels: Record<string, { zh: string; en: string }> = {
  '--leaf-color-surface': { zh: '背景', en: 'Surface' },
  '--leaf-color-surface-muted': { zh: '辅助背景', en: 'Muted background' },
  '--leaf-color-surface-raised': { zh: '抬升背景', en: 'Raised surface' },
  '--leaf-color-text': { zh: '正文', en: 'Body text' },
  '--leaf-color-text-muted': { zh: '次要文字', en: 'Muted text' },
  '--leaf-color-text-subtle': { zh: '辅助文字', en: 'Subtle text' },
  '--leaf-color-border': { zh: '边框', en: 'Border' },
  '--leaf-color-border-hover': { zh: '悬停边框', en: 'Border hover' },
  '--leaf-color-divider': { zh: '分隔线', en: 'Divider' },
};

const segmentLabels: Record<string, { zh: string; en: string }> = {
  surface: { zh: '表面', en: 'Surface' },
  'surface-muted': { zh: '辅助背景', en: 'Muted surface' },
  border: { zh: '边框', en: 'Border' },
  'border-text-muted': { zh: '次要文字边框', en: 'Muted text border' },
  text: { zh: '文字', en: 'Text' },
  'text-muted': { zh: '次要文字', en: 'Muted text' },
  'text-subtle': { zh: '辅助文字', en: 'Subtle text' },
  alpha: { zh: '透明度', en: 'Alpha' },
  white: { zh: '白色', en: 'White' },
  option: { zh: '选项', en: 'Option' },
  hover: { zh: '悬停', en: 'Hover' },
  active: { zh: '按下', en: 'Active' },
};

const stateLabels: Record<string, { zh: string; en: string }> = {
  ink: { zh: '可读文字', en: 'Readable text' },
  indicator: { zh: '选中指示', en: 'Selected indicator' },
  focus: { zh: '焦点', en: 'Focus' },
  'fill-border': { zh: '实色边界', en: 'Solid fill border' },
  hover: { zh: '悬停', en: 'Hover' },
  active: { zh: '按下', en: 'Active' },
  'ink-hover': { zh: '文字悬停', en: 'Ink hover' },
  'ink-active': { zh: '文字按下', en: 'Ink active' },
  'option-hover': { zh: '选项悬停', en: 'Option hover' },
};

const stateOrder = [
  'ink',
  'indicator',
  'focus',
  'fill-border',
  'hover',
  'active',
  'ink-hover',
  'ink-active',
  'option-hover',
];

const categoryOrder: ScaleCategory[] = [
  'surface',
  'border',
  'text',
  'alpha',
  'white',
  'auxiliary',
  'state',
];

const neutralPriority = [
  '--leaf-color-surface',
  '--leaf-color-surface-muted',
  '--leaf-color-surface-raised',
  '--leaf-color-option-hover',
  '--leaf-color-text',
  '--leaf-color-text-muted',
  '--leaf-color-text-subtle',
  '--leaf-color-border',
  '--leaf-color-border-hover',
  '--leaf-color-divider',
];

function buildPalette(appearance: Appearance): PaletteValues {
  const baseColors = Object.fromEntries(
    Object.entries(defaultColors[appearance]).map(([key, value]) => [`--leaf-color-${key}`, value]),
  );
  return { ...baseColors, ...deriveColors(appearance) };
}

const palettes: Record<Appearance, PaletteValues> = {
  light: buildPalette('light'),
  dark: buildPalette('dark'),
};

function ratioFromSlug(slug: string) {
  const decimal = slug.match(/-(\d+)-(\d+)$/u);
  if (decimal) {
    return {
      stem: slug.slice(0, -decimal[0].length),
      ratio: `${Number(`${decimal[1]}.${decimal[2]}`)}%`,
    };
  }
  const numeric = slug.match(/-(\d+(?:\.\d+)?)$/u);
  if (numeric) {
    return {
      stem: slug.slice(0, -numeric[0].length),
      ratio: `${Number(numeric[1])}%`,
    };
  }
  return { stem: slug, ratio: '' };
}

function formatSlug(slug: string, english: boolean) {
  const state = stateLabels[slug];
  if (state) return english ? state.en : state.zh;

  const { stem, ratio } = ratioFromSlug(slug);
  const parts = stem.split('-').filter(Boolean);
  const labels: string[] = [];

  for (let index = 0; index < parts.length; ) {
    const pair = parts.slice(index, index + 2).join('-');
    const pairCopy = segmentLabels[pair];
    if (pairCopy) {
      labels.push(english ? pairCopy.en : pairCopy.zh);
      index += 2;
      continue;
    }
    const part = parts[index] ?? '';
    const copy = segmentLabels[part];
    labels.push(copy ? (english ? copy.en : copy.zh) : part);
    index += 1;
  }

  return [labels.join(' '), ratio].filter(Boolean).join(' ');
}

function neutralLabel(variable: string, english: boolean) {
  const label = neutralLabels[variable];
  if (label) return english ? label.en : label.zh;
  return formatSlug(variable.replace('--leaf-color-', ''), english);
}

function levelFromSlug(slug: string) {
  const ratio = ratioFromSlug(slug).ratio;
  return ratio ? Number.parseFloat(ratio) : Number.POSITIVE_INFINITY;
}

function categoryForToken(variable: string, slug: string): ScaleCategory {
  if (stateLabels[slug]) return 'state';
  const recipe = colorRecipes[variable];
  if (recipe) return recipe[1].split('-')[0] as ScaleCategory;
  return 'auxiliary';
}

function derivedItems(family: SemanticFamily) {
  const { prefix } = semanticFamilyConfig[family];
  return Object.keys(palettes.light)
    .filter((variable) => !baseVariables.has(variable) && variable.startsWith(prefix))
    .flatMap<DerivedColorItem>((variable) => {
      const slug = variable.slice(prefix.length);
      return [{ variable, slug, category: categoryForToken(variable, slug) }];
    })
    .sort((first, second) => {
      const categoryDifference =
        categoryOrder.indexOf(first.category) - categoryOrder.indexOf(second.category);
      if (categoryDifference) return categoryDifference;
      if (first.category === 'state') {
        const firstState = stateOrder.indexOf(first.slug);
        const secondState = stateOrder.indexOf(second.slug);
        if (firstState !== secondState) return firstState - secondState;
      }
      const levelDifference = levelFromSlug(first.slug) - levelFromSlug(second.slug);
      return levelDifference || first.slug.localeCompare(second.slug);
    });
}

function isNeutralVariable(variable: string) {
  return /^--leaf-color-(?:surface|text|border|option)(?:-|$)/u.test(variable);
}

function neutralGroupForVariable(variable: string): NeutralGroup {
  if (variable.startsWith('--leaf-color-border')) return 'border';
  if (
    variable.startsWith('--leaf-color-surface') ||
    variable === '--leaf-color-option-hover' ||
    variable.startsWith('--leaf-color-text-muted-surface') ||
    variable.startsWith('--leaf-color-text-subtle-surface-muted')
  ) {
    return 'background';
  }
  return 'text';
}

function compareNeutralVariables(first: string, second: string) {
  const firstPriority = neutralPriority.indexOf(first);
  const secondPriority = neutralPriority.indexOf(second);
  if (firstPriority !== secondPriority) {
    return (
      (firstPriority === -1 ? Number.POSITIVE_INFINITY : firstPriority) -
      (secondPriority === -1 ? Number.POSITIVE_INFINITY : secondPriority)
    );
  }
  const firstLevel = levelFromSlug(first.replace('--leaf-color-', ''));
  const secondLevel = levelFromSlug(second.replace('--leaf-color-', ''));
  return firstLevel - secondLevel || first.localeCompare(second);
}

function neutralItems(group: NeutralGroup) {
  const items = Object.keys(palettes.light)
    .filter(isNeutralVariable)
    .filter((variable) => neutralGroupForVariable(variable) === group)
    .sort(compareNeutralVariables)
    .flatMap<NeutralColorItem>((variable) => {
      const light = palettes.light[variable];
      const dark = palettes.dark[variable];
      if (!light || !dark) return [];
      return [
        {
          variable,
          zh: neutralLabel(variable, false),
          en: neutralLabel(variable, true),
          light,
          dark,
        },
      ];
    });

  if (group === 'border') {
    const aliasTarget = '--leaf-color-border-surface-70';
    const light = palettes.light[aliasTarget];
    const dark = palettes.dark[aliasTarget];
    if (light && dark) {
      const divider: NeutralColorItem = {
        variable: '--leaf-color-divider',
        zh: '分隔线',
        en: 'Divider',
        light,
        dark,
        alias: `var(${aliasTarget})`,
      };
      const hoverIndex = items.findIndex((item) => item.variable === '--leaf-color-border-hover');
      items.splice(hoverIndex + 1, 0, divider);
    }
  }

  return items;
}

function displayColor(value: string) {
  return value.replace(
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*1(?:\.0+)?)?\)$/u,
    (_, red, green, blue) =>
      `#${[red, green, blue].map((channel) => Number(channel).toString(16).padStart(2, '0')).join('')}`,
  );
}

function ColorChip({
  light,
  dark,
  className,
}: {
  light: string;
  dark: string;
  className?: string;
}) {
  return (
    <span
      className={className ? `leaf-color-chip ${className}` : 'leaf-color-chip'}
      aria-hidden="true"
    >
      <span style={{ backgroundColor: light }} />
      <span style={{ backgroundColor: dark }} />
    </span>
  );
}

function ColorValueChip({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={className ? `leaf-color-value-chip ${className}` : 'leaf-color-value-chip'}
      aria-hidden="true"
    >
      <span style={{ backgroundColor: value }} />
    </span>
  );
}

function ColorValues({
  light,
  dark,
  compact = false,
  inline = false,
}: {
  light: string;
  dark: string;
  compact?: boolean;
  inline?: boolean;
}) {
  const { english } = useDocsLocale();
  return (
    <div
      className="leaf-color-values"
      data-compact={compact || undefined}
      data-inline={inline || undefined}
    >
      <span className="leaf-color-value">
        <span className="leaf-color-value__mode">
          {english ? (compact ? 'L' : 'Light') : compact ? '浅' : '浅色'}
        </span>
        <code>{displayColor(light)}</code>
      </span>
      <span className="leaf-color-value">
        <span className="leaf-color-value__mode">
          {english ? (compact ? 'D' : 'Dark') : compact ? '深' : '深色'}
        </span>
        <code>{displayColor(dark)}</code>
      </span>
    </div>
  );
}

function ColorTableValue({ value }: { value: string }) {
  return (
    <div className="leaf-color-table__value">
      <ColorValueChip value={value} className="leaf-color-value-chip--table" />
      <code>{displayColor(value)}</code>
    </div>
  );
}

function CorePalette() {
  const { english } = useDocsLocale();
  return (
    <div className="leaf-color-core-grid rp-not-doc">
      {coreColorItems.map((item) => {
        const light = palettes.light[item.variable];
        const dark = palettes.dark[item.variable];
        if (!light || !dark) return null;
        return (
          <article className="leaf-color-core-card" key={item.variable}>
            <ColorChip light={light} dark={dark} className="leaf-color-chip--core" />
            <div className="leaf-color-core-card__body">
              <strong>{english ? item.en : item.zh}</strong>
              <code className="leaf-color-variable">{item.variable}</code>
              <p>{english ? item.enDescription : item.zhDescription}</p>
              <ColorValues light={light} dark={dark} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function SemanticPalette({ family }: { family: SemanticFamily }) {
  const { english } = useDocsLocale();
  const config = semanticFamilyConfig[family];
  const items = derivedItems(family);
  const roles = semanticRoleItems[family].filter(
    (item) =>
      palettes.light[item.variable] !== undefined && palettes.dark[item.variable] !== undefined,
  );

  return (
    <section className="leaf-color-family rp-not-doc">
      <div className="leaf-color-family__meta">
        <p>{english ? config.enDescription : config.zhDescription}</p>
        <span>{english ? `${items.length} derived values` : `${items.length} 个派生值`}</span>
      </div>
      <section
        className="leaf-color-ribbon"
        aria-label={english ? `${config.en} derived colors` : `${config.zh}派生色`}
        tabIndex={0}
      >
        <ul className="leaf-color-ribbon__track">
          {items.map((item) => {
            const light = palettes.light[item.variable];
            const dark = palettes.dark[item.variable];
            if (!light || !dark) return null;
            const label = formatSlug(item.slug, english);
            return (
              <li
                className="leaf-color-ribbon__item"
                key={item.variable}
                title={`${item.variable}: ${displayColor(light)} / ${displayColor(dark)}`}
              >
                <ColorChip light={light} dark={dark} className="leaf-color-chip--ribbon" />
                <span className="leaf-color-ribbon__label" aria-hidden="true">
                  {label}
                </span>
                <span className="leaf-color-sr-only">
                  {`${label}: ${item.variable}; ${displayColor(light)} / ${displayColor(dark)}`}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <div className="leaf-color-table-title">{english ? 'Common variables' : '常用变量'}</div>
      <section
        className="leaf-color-table-shell"
        aria-label={english ? `${config.en} common variables` : `${config.zh}常用变量`}
        tabIndex={0}
      >
        <table className="leaf-color-table">
          <caption className="leaf-color-sr-only">
            {english ? `${config.en} common variables` : `${config.zh}常用变量`}
          </caption>
          <thead>
            <tr>
              <th scope="col">{english ? 'Role / variable' : '角色 / 变量'}</th>
              <th scope="col">{english ? 'Light' : '浅色'}</th>
              <th scope="col">{english ? 'Dark' : '深色'}</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => {
              const light = palettes.light[role.variable];
              const dark = palettes.dark[role.variable];
              if (!light || !dark) return null;
              return (
                <tr key={role.variable}>
                  <th scope="row" className="leaf-color-table__role">
                    <strong>{english ? role.en : role.zh}</strong>
                    <code>{role.variable}</code>
                  </th>
                  <td>
                    <ColorTableValue value={light} />
                  </td>
                  <td>
                    <ColorTableValue value={dark} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </section>
  );
}

function NeutralPalette() {
  const { english } = useDocsLocale();
  return (
    <div className="leaf-color-neutral-groups rp-not-doc">
      {neutralGroups.map((group) => {
        const config = neutralGroupConfig[group];
        const items = neutralItems(group);
        const headingId = `leaf-color-neutral-${group}`;
        return (
          <section className="leaf-color-neutral-group" key={group} aria-labelledby={headingId}>
            <header>
              <div>
                <h4 id={headingId}>{english ? config.en : config.zh}</h4>
                <p>{english ? config.enDescription : config.zhDescription}</p>
              </div>
              <span>{english ? `${items.length} entries` : `${items.length} 项`}</span>
            </header>
            <ul>
              {items.map((item) => (
                <li key={item.variable}>
                  <ColorChip light={item.light} dark={item.dark} className="leaf-color-chip--row" />
                  <div className="leaf-color-neutral-row">
                    <div className="leaf-color-neutral-row__title">
                      <strong>{english ? item.en : item.zh}</strong>
                      <code>{item.variable}</code>
                    </div>
                    {item.alias ? (
                      <code className="leaf-color-neutral-row__alias">{item.alias}</code>
                    ) : null}
                    <ColorValues light={item.light} dark={item.dark} compact inline />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function paletteEntries(variables: string[]) {
  return variables.flatMap<PaletteEntry>((variable) => {
    const light = palettes.light[variable];
    const dark = palettes.dark[variable];
    if (!light || !dark) return [];
    return [{ variable, light, dark }];
  });
}

function buildFullPaletteGroups() {
  const neutralVariables = Object.keys(palettes.light)
    .filter(isNeutralVariable)
    .sort(compareNeutralVariables);

  return [
    {
      id: 'core',
      zh: '核心',
      en: 'Core',
      entries: paletteEntries(coreColorItems.map((item) => item.variable)),
    },
    ...semanticFamilies.map((family) => ({
      id: family,
      zh: semanticFamilyConfig[family].zh,
      en: semanticFamilyConfig[family].en,
      entries: paletteEntries(derivedItems(family).map((item) => item.variable)),
    })),
    {
      id: 'neutral',
      zh: '中性',
      en: 'Neutral',
      entries: paletteEntries(neutralVariables),
    },
  ];
}

const fullPaletteGroups = buildFullPaletteGroups();
const fullPaletteCount = fullPaletteGroups.reduce(
  (total, group) => total + group.entries.length,
  0,
);

function FullPalette() {
  const { english } = useDocsLocale();
  return (
    <details className="leaf-color-details rp-not-doc">
      <summary>
        <span className="leaf-color-details__summary">
          <strong>{english ? 'All palette variables' : '全部色板变量'}</strong>
          <span>
            {english
              ? `${fullPaletteCount} variables · light and dark`
              : `${fullPaletteCount} 个变量 · 浅色与深色`}
          </span>
        </span>
      </summary>
      <div className="leaf-color-details__content">
        <section
          className="leaf-color-table-shell"
          aria-label={english ? 'All palette variables' : '全部色板变量'}
          tabIndex={0}
        >
          <table className="leaf-color-table leaf-color-table--all">
            <caption className="leaf-color-sr-only">
              {english ? 'All palette variables' : '全部色板变量'}
            </caption>
            <thead>
              <tr>
                <th scope="col">{english ? 'Variable' : '变量'}</th>
                <th scope="col">{english ? 'Light' : '浅色'}</th>
                <th scope="col">{english ? 'Dark' : '深色'}</th>
              </tr>
            </thead>
            {fullPaletteGroups.map((group) => (
              <tbody key={group.id}>
                <tr className="leaf-color-table__group">
                  <th scope="rowgroup" colSpan={3}>
                    <span>{english ? group.en : group.zh}</span>
                    <span>{group.entries.length}</span>
                  </th>
                </tr>
                {group.entries.map((entry) => (
                  <tr key={entry.variable}>
                    <th scope="row" className="leaf-color-table__variable">
                      <code>{entry.variable}</code>
                    </th>
                    <td>
                      <ColorTableValue value={entry.light} />
                    </td>
                    <td>
                      <ColorTableValue value={entry.dark} />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </section>
      </div>
    </details>
  );
}

export function ColorPalette({ family }: { family: ColorFamily }) {
  if (family === 'base') return <CorePalette />;
  if (family === 'neutral') return <NeutralPalette />;
  if (family === 'all') return <FullPalette />;
  return <SemanticPalette family={family} />;
}

export function PaletteVariableCount() {
  return fullPaletteCount;
}
