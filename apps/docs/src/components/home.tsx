import { Badge } from '@sudden3/leaf-ui';
import { ButtonLink } from './button-link';
import { componentCatalog } from './component-catalog';
import { CopyButton } from './copy-button';
import { HomeShowcase, MotionGallery } from './home-showcase';
import { useDocsLocale } from './i18n';
import { Icon } from './icon';
import { ThemePlayground } from './theme-playground';

export function HomeLayout() {
  const { t, url } = useDocsLocale();
  const features = [
    {
      icon: 'sliders',
      title: t('顺着你的动作。', 'In step with you.'),
      text: t(
        '选择、展开、加载，每一步都接得自然。细节让界面更顺手。',
        'Selection, disclosure and loading flow into one another. Details make the interface feel effortless.',
      ),
    },
    {
      icon: 'leaf',
      title: t('留白，也是设计。', 'Room to breathe.'),
      text: t(
        '清晰的层次，安静的底色。让品牌和内容拥有自己的表达。',
        'Clear hierarchy and calm surfaces give your brand and content their own voice.',
      ),
    },
    {
      icon: 'code',
      title: t('从细节到整个产品。', 'From detail to product.'),
      text: t(
        `${componentCatalog.length} 个 React 组件，照顾表单、键盘、主题和每一种状态。`,
        `${componentCatalog.length} React components with care for forms, keyboards, themes and every state.`,
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
            `${componentCatalog.length} 个组件 · 一个顺手的体验`,
            `${componentCatalog.length} components · One effortless experience`,
          )}
        />
        <h1>
          {t('让界面，', 'Interfaces that ')}
          <span>{t('流动起来。', 'feel alive.')}</span>
        </h1>
        <p>
          {t(
            '从一次轻巧的按下，到流畅的状态变化。',
            'From a subtle press to a seamless change of state.',
          )}
          <br />
          {t(
            '用 Leaf UI，构建清晰、自然、有回应的产品。',
            'Build clear, thoughtful, responsive products with Leaf UI.',
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
        <div className="leaf-install">
          <Icon name="code" width="15" height="15" />
          <code>pnpm add @sudden3/leaf-ui</code>
          <CopyButton
            text="pnpm add @sudden3/leaf-ui"
            label={t('复制安装命令', 'Copy install command')}
          />
        </div>
        <span className="leaf-hero__note">
          React 18 / 19 <span>·</span> TypeScript <span>·</span> CSS Variables
        </span>
      </section>
      <HomeShowcase />
      <section className="leaf-features" aria-label={t('设计理念', 'Design principles')}>
        {features.map((feature) => (
          <article key={feature.icon}>
            <Icon name={feature.icon} width="19" height="19" />
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>
      <section className="leaf-home-motion" aria-labelledby="motion-heading">
        <div className="leaf-section-heading">
          <div>
            <span className="leaf-eyebrow">SMALL DETAILS. BETTER FEEL.</span>
            <h2 id="motion-heading">
              {t('亲手试一下，会更有感觉。', 'A little interaction goes a long way.')}
            </h2>
            <p>
              {t(
                '切换、展开、保存。好体验，藏在每一次操作里。',
                'Switch, unfold, save. The experience is in every little action.',
              )}
            </p>
          </div>
        </div>
        <MotionGallery />
      </section>
      <section className="leaf-home-playground" aria-labelledby="playground-heading">
        <div className="leaf-section-heading">
          <div>
            <span className="leaf-eyebrow">MAKE IT YOURS</span>
            <h2 id="playground-heading">
              {t('同一套组件，你的风格。', 'The same components. Your own style.')}
            </h2>
            <p>
              {t(
                '颜色、圆角、外观和动效，都可以按产品的节奏调整。',
                'Tune colors, corners, appearance and motion to the rhythm of your product.',
              )}
            </p>
          </div>
          <ButtonLink
            variant="ghost"
            size="sm"
            href={url('/guide/theming.html')}
            endIcon={<Icon name="arrow" />}
          >
            {t('了解主题定制', 'Explore theming')}
          </ButtonLink>
        </div>
        <ThemePlayground />
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
