import { Mentions } from '@ifhover/leaf-ui';

export function MentionsPopup({ english = false }: { english?: boolean }) {
  return (
    <Mentions
      aria-label={english ? 'Comment with content-sized suggestions' : '按内容定宽的提及建议'}
      placeholder={english ? 'Type @ to see suggestions' : '输入 @ 查看建议'}
      popupWidth="auto"
      popupMaxWidth={280}
      options={[
        { value: 'design', label: english ? 'Design team' : '设计团队' },
        { value: 'engineering', label: english ? 'Engineering team' : '研发团队' },
      ]}
    />
  );
}
