import { Card, Flex, Grid } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';
import {
  ArrowRight,
  Blocks,
  Braces,
  Globe2,
  Keyboard,
  Leaf,
  Monitor,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink } from './button-link';
import { useDocsLocale } from './i18n';
import './introduction.scss';

export function IntroductionHero({ children }: { children: ReactNode }) {
  const { t, url } = useDocsLocale();
  return (
    <section className="leaf-intro-hero rp-not-doc" aria-label="Leaf UI">
      <Flex direction="column" align="center" gap={16}>
        <img src={withBase('/leaf.svg')} width={72} height={72} alt="" />
        <p className="leaf-intro-hero__name">Leaf UI</p>
        <p className="leaf-intro-hero__tagline">
          {t('轻盈 · 自然 · 可定制', 'Lightweight · Natural · Customizable')}
        </p>
        <div className="leaf-intro-hero__description">{children}</div>
        <Flex gap={8} justify="center" wrap className="leaf-intro-hero__badges">
          <span>
            <Blocks size={14} aria-hidden="true" />
            React 18 / 19
          </span>
          <span>
            <ShieldCheck size={14} aria-hidden="true" />
            TypeScript
          </span>
          <span>
            <Monitor size={14} aria-hidden="true" />
            SSR
          </span>
          <span>
            <Braces size={14} aria-hidden="true" />
            ESM / CommonJS
          </span>
        </Flex>
        <Flex gap={12} justify="center" wrap>
          <ButtonLink href={url('/guide/getting-started.html')} endIcon={<ArrowRight size={16} />}>
            {t('开始使用', 'Get started')}
          </ButtonLink>
          <ButtonLink variant="outline" href={url('/components/index.html')}>
            {t('探索组件', 'Explore components')}
          </ButtonLink>
        </Flex>
      </Flex>
    </section>
  );
}

const featureIcons = {
  leaf: Leaf,
  palette: Palette,
  types: ShieldCheck,
  components: Blocks,
  languages: Globe2,
  keyboard: Keyboard,
};

export function IntroductionFeatures({ children }: { children: ReactNode }) {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} className="leaf-intro-features rp-not-doc">
      {children}
    </Grid>
  );
}

export function IntroductionFeature({
  icon,
  title,
  children,
}: {
  icon: keyof typeof featureIcons;
  title: string;
  children: ReactNode;
}) {
  const Icon = featureIcons[icon];
  return (
    <Card
      className="leaf-intro-feature"
      title={
        <Flex align="center" gap={10}>
          <Icon size={20} className="leaf-intro-feature__icon" aria-hidden="true" />
          {title}
        </Flex>
      }
    >
      <div className="leaf-intro-feature__description">{children}</div>
    </Card>
  );
}

const browsers = [
  { name: 'Chrome', icon: 'chrome', minimum: '109' },
  { name: 'Edge', icon: 'edge', minimum: '109' },
  { name: 'Firefox', icon: 'firefox', minimum: '121' },
  { name: 'Safari', icon: 'safari', minimum: '16.4' },
];

export function IntroductionBrowsers() {
  const { t } = useDocsLocale();
  return (
    <ul
      className="leaf-intro-browsers rp-not-doc"
      aria-label={t('浏览器最低版本', 'Minimum browser versions')}
    >
      {browsers.map(({ name, icon, minimum }) => (
        <li key={name}>
          <img src={withBase(`/browsers/${icon}.svg`)} width={32} height={32} alt="" />
          <span>{name}</span>
          <span className="leaf-intro-browsers__version">≥ {minimum}</span>
        </li>
      ))}
    </ul>
  );
}
