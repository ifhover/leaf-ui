import './component-overview.css';
import { Button } from '@leaf-ui/react';
import { withBase } from '@rspress/core/runtime';
import { Icon } from './icon';

export function ComponentOverview() {
  return (
    <div className="leaf-component-grid">
      <article className="leaf-component-card">
        <div className="leaf-component-card__preview">
          <Button>开始使用</Button>
          <Button variant="outline">了解更多</Button>
        </div>
        <div className="leaf-component-card__body">
          <span className="leaf-component-card__category">通用</span>
          <h3>
            <a href={withBase('/components/button')}>
              Button 按钮 <Icon name="arrow" width="16" height="16" />
            </a>
          </h3>
          <p>触发操作的基础组件，支持多种样式、尺寸与交互状态。</p>
          <div>
            <span>4 种样式</span>
            <span>3 种尺寸</span>
          </div>
        </div>
      </article>
    </div>
  );
}
