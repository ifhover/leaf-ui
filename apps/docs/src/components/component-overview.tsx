import './component-overview.scss';
import { withBase } from '@rspress/core/runtime';
import { ArrowUpRight } from 'lucide-react';

const components = [
  {
    name: 'Button',
    label: '按钮',
    category: '通用',
    description: '触发操作，如保存、提交或删除。',
    slug: 'button',
  },
  {
    name: 'Input',
    label: '输入框',
    category: '数据录入',
    description: '输入姓名、邮箱等单行文本。',
    slug: 'input',
  },
  {
    name: 'Textarea',
    label: '文本域',
    category: '数据录入',
    description: '填写留言、简介等多行内容。',
    slug: 'textarea',
  },
  {
    name: 'Checkbox',
    label: '复选框',
    category: '数据录入',
    description: '从一组选项中勾选多项。',
    slug: 'checkbox',
  },
  {
    name: 'Radio',
    label: '单选框',
    category: '数据录入',
    description: '从一组选项中选择一项。',
    slug: 'radio',
  },
  {
    name: 'Switch',
    label: '开关',
    category: '数据录入',
    description: '即时开启或关闭设置。',
    slug: 'switch',
  },
  {
    name: 'Select',
    label: '选择器',
    category: '数据录入',
    description: '从下拉列表中选择一项。',
    slug: 'select',
  },
  {
    name: 'DatePicker',
    label: '日期选择器',
    category: '数据录入',
    description: '从日历中选择日期。',
    slug: 'date-picker',
  },
  {
    name: 'TimePicker',
    label: '时间选择器',
    category: '数据录入',
    description: '选择小时和分钟。',
    slug: 'time-picker',
  },
  {
    name: 'AutoComplete',
    label: '自动完成',
    category: '数据录入',
    description: '通过输入建议快速完成填写。',
    slug: 'auto-complete',
  },
  {
    name: 'Cascader',
    label: '级联选择',
    category: '数据录入',
    description: '逐级选择地区、分类等选项。',
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
          href={withBase(`/components/${component.slug}.html`)}
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
