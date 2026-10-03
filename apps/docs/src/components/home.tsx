import { Button } from '@leaf-ui/react';
import { withBase } from '@rspress/core/runtime';
import { useState } from 'react';
import { CopyButton } from './copy-button';
import { Icon } from './icon';
import { ThemePlayground } from './theme-playground';

const features = [
  {
    icon: 'leaf',
    number: '01',
    title: '轻盈，自然',
    text: '克制的视觉，恰好的细节。让内容成为主角，让交互自然发生。',
  },
  {
    icon: 'sliders',
    number: '02',
    title: '随你而变',
    text: '主题色、圆角、字体与动效，用 CSS 变量，定义你的设计语言。',
  },
  {
    icon: 'code',
    number: '03',
    title: '为 React 而生',
    text: '完整的 TypeScript 类型，熟悉的原生属性，融入你的开发习惯。',
  },
] as const;

export function HomeLayout() {
  const [liked, setLiked] = useState(false);

  return (
    <main className="leaf-home">
      <section className="leaf-hero">
        <div className="leaf-hero__content">
          <div className="leaf-release">
            <span />
            11 个基础组件，开始生长 <span className="leaf-release__version">v0.1.0</span>
          </div>
          <h1>
            为你的界面，
            <br />
            添一抹<span className="leaf-hero__accent">自然。</span>
          </h1>
          <p>
            轻盈的 React 组件，自然的设计语言。
            <br />
            让每一个好想法，都有舒适的表达。
          </p>
          <div className="leaf-hero__actions">
            <a
              className="leaf-home-link leaf-home-link--primary"
              href={withBase('/guide/getting-started.html')}
            >
              开始使用 <Icon name="arrow" width="18" height="18" />
            </a>
            <a
              className="leaf-home-link leaf-home-link--secondary"
              href={withBase('/components/index.html')}
            >
              <Icon name="code" width="18" height="18" />
              探索组件
            </a>
          </div>
          <div className="leaf-install">
            <span className="leaf-install__prompt">
              <Icon name="code" width="15" height="15" />
            </span>
            <code>import &#123; Button &#125; from '@leaf-ui/react';</code>
            <CopyButton text="import { Button } from '@leaf-ui/react';" label="复制" />
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
              <span>一切，从这里开始</span>
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
              <h2>把灵感，种进界面。</h2>
              <p>简单的组件，装得下不简单的想法。</p>
              <div>
                <Button
                  size="sm"
                  endIcon={<Icon name="arrow" />}
                  onClick={() => setLiked(!liked)}
                  aria-pressed={liked}
                >
                  {liked ? '灵感已收藏' : '让灵感生长'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={liked ? '取消收藏' : '收藏灵感'}
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
            <span>恰到好处的细节</span>
          </div>
          <div className="leaf-floating-note leaf-floating-note--bottom">
            <span className="leaf-floating-colors">
              <i />
              <i />
              <i />
            </span>
            <span>你的品牌，你的颜色</span>
          </div>
          <span className="leaf-visual-caption">A LITTLE LEAF. A LOT OF POSSIBILITY.</span>
        </div>
      </section>
      <section className="leaf-features" aria-label="设计理念">
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
            <h2 id="playground-heading">自然，也可以有你的个性。</h2>
            <p>换一种颜色，调一点圆角。看看 Leaf UI 如何融入你的产品。</p>
          </div>
          <a href={withBase('/guide/theming.html')}>
            了解主题定制 <Icon name="arrow" width="16" height="16" />
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
          <h2>从日常表单，开始生长。</h2>
          <p>统一尺寸，轻盈交互。把每一个基础细节，都照顾好。</p>
        </div>
        <a
          className="leaf-home-link leaf-home-link--secondary"
          href={withBase('/components/index.html')}
        >
          探索基础组件 <Icon name="arrow" width="18" height="18" />
        </a>
      </section>
      <footer className="leaf-home-footer">
        <span>
          <Icon name="leaf" width="17" height="17" />
          Leaf UI
        </span>
        <p>让界面自然生长。</p>
        <span className="leaf-home-footer__credit">Built with React & Rspress</span>
      </footer>
    </main>
  );
}
