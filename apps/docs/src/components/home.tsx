import { Button } from '@sudden3/leaf-ui';
import { useState } from 'react';
import { CopyButton } from './copy-button';
import { useDocsLocale } from './i18n';
import { Icon } from './icon';
import { ThemePlayground } from './theme-playground';

export function HomeLayout() {
  const { t, url } = useDocsLocale();
  const features = [
    {
      icon: 'leaf',
      number: '01',
      title: t('轻盈，自然', 'Lightweight, natural'),
      text: t(
        '克制的视觉，恰好的细节。让内容成为主角，让交互自然发生。',
        'Calm visuals and thoughtful details. Give your content room to breathe.',
      ),
    },
    {
      icon: 'sliders',
      number: '02',
      title: t('随你而变', 'Make it yours'),
      text: t(
        '轻松调整主题色、圆角与尺寸，定义你的设计语言。',
        'Choose your colors, shapes and sizes to express your design.',
      ),
    },
    {
      icon: 'code',
      number: '03',
      title: t('为 React 而生', 'Made for React'),
      text: t(
        '完整的 TypeScript 类型，熟悉的原生属性，融入你的开发习惯。',
        'TypeScript types and familiar HTML properties fit your React workflow.',
      ),
    },
  ] as const;

  const [liked, setLiked] = useState(false);

  return (
    <main className="leaf-home">
      <section className="leaf-hero">
        <div className="leaf-hero__content">
          <div className="leaf-release">
            <span />
            {t('32 个组件，持续生长', '32 components, growing together')}
          </div>
          <h1>
            {t('为你的界面，', 'For your interface,')}
            <br />
            {t('添一抹', 'a touch of ')}
            <span className="leaf-hero__accent">{t('自然。', 'nature.')}</span>
          </h1>
          <p>
            {t(
              '轻盈的 React 组件，自然的设计语言。',
              'Lightweight React components. A natural design language.',
            )}
            <br />
            {t('让每一个好想法，都有舒适的表达。', 'A comfortable home for every good idea.')}
          </p>
          <div className="leaf-hero__actions">
            <a
              className="leaf-home-link leaf-home-link--primary"
              href={url('/guide/getting-started.html')}
            >
              {t('开始使用', 'Get started')}
              <Icon name="arrow" width="18" height="18" />
            </a>
            <a
              className="leaf-home-link leaf-home-link--secondary"
              href={url('/components/index.html')}
            >
              <Icon name="code" width="18" height="18" />
              {t('探索组件', 'Explore components')}
            </a>
          </div>
          <div className="leaf-install">
            <span className="leaf-install__prompt">
              <Icon name="code" width="15" height="15" />
            </span>
            <code>pnpm add @sudden3/leaf-ui</code>
            <CopyButton
              text="pnpm add @sudden3/leaf-ui"
              label={t('复制安装命令', 'Copy install command')}
            />
          </div>
          <span className="leaf-hero__note">
            React 18 / 19 <span>·</span> TypeScript <span>·</span> CSS Variables
          </span>
        </div>
        <div className="leaf-hero__visual">
          <div className="leaf-orbit leaf-orbit--one" />
          <div className="leaf-orbit leaf-orbit--two" />
          <div className="leaf-hero-card">
            <div className="leaf-hero-card__header">
              <span className="leaf-hero-card__logo">
                <Icon name="leaf" />
              </span>
              <span>{t('一切，从这里开始', 'It all starts here')}</span>
              <span className="leaf-hero-card__dots">···</span>
            </div>
            <div className="leaf-hero-card__art">
              <svg aria-hidden="true" viewBox="0 0 300 160" fill="none">
                <path d="M147 146C108 142 82 111 83 66C128 66 153 98 147 146Z" fill="#a7cbb0" />
                <path d="M148 146C142 88 166 28 222 17C235 76 207 130 148 146Z" fill="#427d52" />
                <path d="M145 144C108 124 79 113 52 127C78 153 113 159 145 144Z" fill="#d0dfbf" />
                <path
                  d="M148 156C145 111 164 72 191 48M144 147L107 93"
                  stroke="#264f34"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="leaf-hero-card__art-caption">GROW AT YOUR OWN PACE</span>
            </div>
            <div className="leaf-hero-card__body">
              <h2>{t('把灵感，种进界面。', 'Plant ideas in your interface.')}</h2>
              <p>
                {t(
                  '简单的组件，装得下不简单的想法。',
                  'Simple components for ideas with possibilities.',
                )}
              </p>
              <div>
                <Button
                  size="sm"
                  endIcon={<Icon name="arrow" />}
                  onClick={() => setLiked(!liked)}
                  aria-pressed={liked}
                >
                  {liked ? t('灵感已收藏', 'Idea saved') : t('让灵感生长', 'Let ideas grow')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={
                    liked ? t('取消收藏', 'Remove saved idea') : t('收藏灵感', 'Save idea')
                  }
                  aria-pressed={liked}
                  onClick={() => setLiked(!liked)}
                  startIcon={<Icon name={liked ? 'check' : 'heart'} />}
                />
              </div>
            </div>
          </div>
          <div className="leaf-floating-note leaf-floating-note--top">
            <span className="leaf-floating-note__icon">
              <Icon name="check" width="15" height="15" />
            </span>
            <span>{t('恰到好处的细节', 'Thoughtful details')}</span>
          </div>
          <div className="leaf-floating-note leaf-floating-note--bottom">
            <span className="leaf-floating-colors">
              <i />
              <i />
              <i />
            </span>
            <span>{t('你的品牌，你的颜色', 'Your brand, your colors')}</span>
          </div>
          <span className="leaf-visual-caption">A LITTLE LEAF. A LOT OF POSSIBILITY.</span>
        </div>
      </section>
      <section className="leaf-features" aria-label={t('设计理念', 'Design principles')}>
        {features.map((feature) => (
          <article key={feature.number}>
            <div className="leaf-feature-heading">
              <Icon name={feature.icon} />
              <span>{feature.number}</span>
            </div>
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>
      <section className="leaf-home-playground" aria-labelledby="playground-heading">
        <div className="leaf-section-heading">
          <div>
            <span className="leaf-eyebrow">MAKE IT YOURS</span>
            <h2 id="playground-heading">
              {t('自然，也可以有你的个性。', 'Natural, with your personality.')}
            </h2>
            <p>
              {t(
                '换一种颜色，调一点圆角。看看 Leaf UI 如何融入你的产品。',
                'Change colors and corners to make Leaf UI fit your product.',
              )}
            </p>
          </div>
          <a href={url('/guide/theming.html')}>
            {t('了解主题定制', 'Explore theming')}
            <Icon name="arrow" width="16" height="16" />
          </a>
        </div>
        <ThemePlayground />
      </section>
      <section className="leaf-next">
        <span className="leaf-next__icon">
          <Icon name="leaf" width="30" height="30" />
        </span>
        <div>
          <span className="leaf-eyebrow">SMALL START. THOUGHTFUL DETAILS.</span>
          <h2>{t('从日常表单，开始生长。', 'Grow from everyday forms.')}</h2>
          <p>
            {t(
              '统一尺寸，轻盈交互。把每一个基础细节，都照顾好。',
              'Consistent controls and calm interactions, with care in every detail.',
            )}
          </p>
        </div>
        <a
          className="leaf-home-link leaf-home-link--secondary"
          href={url('/components/index.html')}
        >
          {t('探索基础组件', 'Explore components')}
          <Icon name="arrow" width="18" height="18" />
        </a>
      </section>
      <footer className="leaf-home-footer">
        <span>
          <Icon name="leaf" width="17" height="17" />
          Leaf UI
        </span>
        <p>{t('让界面自然生长。', 'Let your interface grow naturally.')}</p>
        <span className="leaf-home-footer__credit">Built with React & Rspress</span>
      </footer>
    </main>
  );
}
