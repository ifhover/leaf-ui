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
    description: '统一主题的选项面板与键盘选择。',
    slug: 'select',
  },
  {
    name: 'DatePicker',
    label: '日期选择器',
    category: '数据录入',
    description: '日历选择，支持日期限制与清除。',
    slug: 'date-picker',
  },
  {
    name: 'TimePicker',
    label: '时间选择器',
    category: '数据录入',
    description: '小时与分钟选择，自定义分钟间隔。',
    slug: 'time-picker',
  },
  {
    name: 'AutoComplete',
    label: '自动完成',
    category: '数据录入',
    description: '自由输入文本，选择匹配建议。',
    slug: 'auto-complete',
  },
  {
    name: 'Cascader',
    label: '级联选择',
    category: '数据录入',
    description: '逐级展开选项，选择完整路径。',
    slug: 'cascader',
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
