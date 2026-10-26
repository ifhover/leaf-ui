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
        '清楚的状态反馈、克制的动效、完整的键盘操作。常用的交互，已经替你照顾好。',
        'Clear feedback, restrained motion and keyboard support. The everyday interactions are taken care of.',
      ),
    },
    {
      icon: 'leaf',
      title: t('安静一致，内容优先。', 'Quiet by default. Content first.'),
      text: t(
        '中性的表面、细边框和轻阴影构成层次，让数据和内容成为主角。主题色只标记主要操作与选中状态，接入品牌色后结构依然一致。',
        'Neutral surfaces, fine borders and light shadows build the hierarchy and keep data in focus. Brand color marks primary actions and selection, and the structure stays consistent when it changes.',
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
        <Badge className="leaf-release">
          {t(
            `${componentCatalog.length} 个 React 组件 · 开箱即用，风格统一`,
            `${componentCatalog.length} React components · Consistent out of the box`,
          )}
        </Badge>
        <h1>
          <span className="leaf-hero__brand">Leaf UI</span>
          <span className="leaf-hero__headline">
            {t('让好想法，长成好界面。', 'Good ideas deserve great interfaces.')}
          </span>
        </h1>
        <p>
          {t(
            '安静、一致、细节到位的 React 组件库。',
            'A quiet, consistent React component library with the details in place.',
          )}
          <br />
          {t(
            '从按钮到表单，统一的尺寸、状态与交互，让界面专注于内容。',
            'From buttons to forms, shared sizing, states and interactions keep the focus on your content.',
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
