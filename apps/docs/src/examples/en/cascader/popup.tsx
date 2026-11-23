import { Cascader, type CascaderOption, Form, FormField } from '@ifhover/leaf-ui';

const regions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          { value: 'xihu', label: 'Xihu' },
          { value: 'yuhang', label: 'Yuhang' },
        ],
      },
      { value: 'ningbo', label: 'Ningbo' },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      { value: 'nanjing', label: 'Nanjing' },
      { value: 'suzhou', label: 'Suzhou' },
    ],
  },
];

export function CascaderPopup() {
  return (
    <Form layout="vertical">
      <FormField label="Bounded max width">
        <Cascader options={regions} placeholder="Choose a region" popupMaxWidth={280} />
      </FormField>
      <FormField label="Match trigger width">
        <Cascader options={regions} placeholder="Choose a region" popupWidth="trigger" />
      </FormField>
    </Form>
  );
}
