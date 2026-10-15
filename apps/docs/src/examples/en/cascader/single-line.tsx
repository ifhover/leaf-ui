import { Cascader } from '@ifhover/leaf-ui';

const options = [
  {
    value: 'product',
    label: 'Product',
    children: [
      { value: 'design', label: 'Experience design' },
      { value: 'web', label: 'Web development' },
      { value: 'mobile', label: 'Mobile development' },
    ],
  },
];

export function SingleLine() {
  return (
    <Cascader
      aria-label="Product teams"
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
