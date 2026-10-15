import { Cascader } from '@ifhover/leaf-ui';

const options = [
  {
    value: 'product',
    label: '产品团队',
    children: [
      { value: 'design', label: '产品体验设计' },
      { value: 'web', label: '前端开发' },
      { value: 'mobile', label: '移动端开发' },
    ],
  },
];

export function SingleLine() {
  return (
    <Cascader
      aria-label="产品团队"
      multiple
      showSearch
      tagWrap={false}
      options={options}
      defaultValue={[
        ['product', 'design'],
        ['product', 'web'],
        ['product', 'mobile'],
      ]}
    />
  );
}
