import { Badge } from '@ifhover/leaf-ui';
import { ButtonLink } from './button-link';
import { componentCatalog } from './component-catalog';
import { HomeShowcase } from './home-showcase';
import { useDocsLocale } from './i18n';
import { Icon } from './icon';
import { PackageInstall } from './package-install';

export function HomeLayout() {
  const { t, url } = useDocsLocale();
  const features = [
    {
      icon: 'sliders',
      title: t('交互顺手，细节到位。', 'Small details. Smoother interactions.'),
      text: t(
        '清楚的状态反馈、自然的动效、完整的键盘操作。常用的交互，已经替你照顾好。',
        'Clear feedback, natural motion and keyboard support. The everyday interactions are taken care of.',
      ),
    },
    {
      icon: 'leaf',
      title: t('你的品牌，自有风格。', 'Your brand. Your style.'),
      text: t(
        '从主题色、圆角到深浅外观，几处设置就能融入你的产品。默认好看，也经得起定制。',
        'Make it yours with colors, corners and light or dark themes. Start with thoughtful defaults and adapt them to your product.',
      ),
    },
    {
      icon: 'code',
      title: t('常用参数，只设一次。', 'Set it once. Use it everywhere.'),
      text: t(
        '按钮样式、输入提示、弹窗防误关，一处配置，全站沿用。省去重复传参，个别组件仍可单独调整。',
        'Share button styles, input hints and modal closing behavior across your app. Skip repeated props and override individual components when needed.',
      ),
      href: url(
        t(
          '/components/config-provider.html#组件默认值',
          '/components/config-provider.html#component-defaults',
        ),
      ),
    },
  ] as const;
  return (
    <main className="leaf-home">
      <section className="leaf-hero">
        <Badge
          className="leaf-release"
          status="success"
          color="var(--leaf-color-primary)"
          text={t(
            `${componentCatalog.length} 个 React 组件 · 开箱即用，随你定制`,
            `${componentCatalog.length} React components · Ready to make your own`,
          )}
        />
        <h1>
          <span className="leaf-hero__brand">Leaf UI</span>
          <span className="leaf-hero__headline">
            {t('让好想法，长成好界面。', 'Good ideas deserve great interfaces.')}
          </span>
        </h1>
        <p>
          {t(
            '轻盈、好用、随你定制的 React 组件库。',
            'A lightweight React component library that feels right at home.',
          )}
          <br />
          {t(
            '从按钮到表单，细节已经就位，接下来随你发挥。',
            'From buttons to forms, the details are ready. Make something of your own.',
          )}
        </p>
        <div className="leaf-hero__actions">
          <ButtonLink
            size="lg"
            href={url('/guide/getting-started.html')}
            endIcon={<Icon name="arrow" />}
          >
            {t('开始构建', 'Start building')}
          </ButtonLink>
          <ButtonLink size="lg" variant="outline" href={url('/components/index.html')}>
            {t('探索组件', 'Explore components')}
          </ButtonLink>
        </div>
        <PackageInstall variant="hero" />
        <span className="leaf-hero__note">
          React 18 / 19 <span>·</span> TypeScript <span>·</span> CSS Variables
        </span>
      </section>
      <HomeShowcase />
      <section className="leaf-features" aria-label={t('产品特点', 'Product features')}>
        {features.map((feature) => (
          <article key={feature.icon}>
            <Icon name={feature.icon} width="19" height="19" />
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
            {'href' in feature && (
              <ButtonLink variant="link" href={feature.href} endIcon={<Icon name="arrow" />}>
                {t('了解组件默认值', 'Explore component defaults')}
              </ButtonLink>
            )}
          </article>
        ))}
      </section>
      <section className="leaf-next">
        <div>
          <span className="leaf-eyebrow">YOUR NEXT GOOD IDEA</span>
          <h2>
            {t('从一个细节，做到整个产品。', 'Start with a detail. Build the whole product.')}
          </h2>
          <p>
            {t(
              '表单、导航、反馈、数据展示。一起，把界面做好。',
              'Forms, navigation, feedback and data. Bring a thoughtful interface together.',
            )}
          </p>
        </div>
        <ButtonLink
          variant="outline"
          href={url('/components/index.html')}
          endIcon={<Icon name="arrow" />}
        >
          {t('查看全部组件', 'Explore all components')}
        </ButtonLink>
      </section>
      <footer className="leaf-home-footer">
        <span>
          <Icon name="leaf" width="17" height="17" />
          Leaf UI
        </span>
        <p>{t('清晰的设计，自然的交互。', 'Clear design. Natural interaction.')}</p>
        <span className="leaf-home-footer__credit">Built with React & Rspress</span>
      </footer>
    </main>
  );
}
