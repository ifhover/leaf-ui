import { Mentions } from '@ifhover/leaf-ui';

export function MentionsPopup() {
  return (
    <Mentions
      aria-label="按内容定宽的提及建议"
      placeholder="输入 @ 查看建议"
      popupWidth="auto"
      popupMaxWidth={280}
      options={[
        { value: 'design', label: '设计团队' },
        { value: 'engineering', label: '研发团队' },
      ]}
    />
  );
}
