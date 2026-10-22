import { TreeSelect } from '@ifhover/leaf-ui';

const options = (english: boolean) => [
  {
    value: 'team',
    label: english ? 'Team' : '团队',
    children: [
      { value: 'alice', label: 'Alice' },
      { value: 'bob', label: 'Bob' },
      { value: 'carol', label: 'Carol' },
    ],
  },
];

export function PopupWidth({ english = false }) {
  return (
    <TreeSelect
      aria-label={english ? 'Team members' : '团队成员'}
      options={options(english)}
      placeholder={english ? 'The panel fits its content' : '浮层按内容定宽'}
      popupMaxWidth={320}
      popupWidth="auto"
    />
  );
}
