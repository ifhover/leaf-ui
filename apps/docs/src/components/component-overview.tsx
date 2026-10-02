import './component-overview.scss';
import { withBase } from '@rspress/core/runtime';
import { ArrowUpRight } from 'lucide-react';

const components = [
  {
    name: 'Button',
    label: '按钮',
    category: '通用',
    description: '触发操作，支持图标与危险状态。',
    slug: 'button',
  },
  {
    name: 'Input',
    label: '输入框',
    category: '数据录入',
    description: '单行输入，支持前后缀和校验状态。',
    slug: 'input',
  },
  {
    name: 'Textarea',
    label: '文本域',
    category: '数据录入',
    description: '多行文本，保留原生输入与缩放。',
    slug: 'textarea',
  },
  {
    name: 'Checkbox',
    label: '复选框',
    category: '数据录入',
    description: '多项选择，支持全选与半选。',
    slug: 'checkbox',
  },
  {
    name: 'Radio',
    label: '单选框',
    category: '数据录入',
    description: '互斥选择，支持分组和键盘切换。',
    slug: 'radio',
  },
  {
    name: 'Switch',
    label: '开关',
    category: '数据录入',
    description: '即时切换，支持禁用与加载。',
    slug: 'switch',
  },
  {
    name: 'Select',
    label: '选择器',
    category: '数据录入',
    description: '从选项中选择，支持原生表单。',
    slug: 'select',
  },
];

export function ComponentOverview() {
  return (
    <div className="leaf-component-grid">
      {components.map((component) => (
        <a
          key={component.slug}
          className="leaf-component-card"
          href={withBase(`/components/${component.slug}`)}
        >
          <div className="leaf-component-card__preview">
            <img
              src={withBase(`/components/${component.slug}.svg`)}
              alt=""
              width={240}
              height={128}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="leaf-component-card__body">
            <span className="leaf-component-card__category">{component.category}</span>
            <h3>
              {component.name} <span>{component.label}</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </h3>
            <p>{component.description}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
