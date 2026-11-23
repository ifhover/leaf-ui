import { Cascader, type CascaderOption, Form, FormField } from '@ifhover/leaf-ui';

const regions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          { value: 'xihu', label: '西湖' },
          { value: 'yuhang', label: '余杭' },
        ],
      },
      { value: 'ningbo', label: '宁波' },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      { value: 'nanjing', label: '南京' },
      { value: 'suzhou', label: '苏州' },
    ],
  },
];

export function CascaderPopup() {
  return (
    <Form layout="vertical">
      <FormField label="限制最大宽度">
        <Cascader options={regions} placeholder="选择地区" popupMaxWidth={280} />
      </FormField>
      <FormField label="与控件等宽">
        <Cascader options={regions} placeholder="选择地区" popupWidth="trigger" />
      </FormField>
    </Form>
  );
}
