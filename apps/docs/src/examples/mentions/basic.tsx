import { Mentions } from '@ifhover/leaf-ui';
export function MentionsBasic({ english = false }: { english?: boolean }) {
  return (
    <Mentions
      aria-label={english ? 'Comment' : '评论'}
      placeholder={english ? 'Type @ to mention a teammate' : '输入 @ 提及团队成员'}
      options={[
        { value: 'ada', label: 'Ada' },
        { value: 'lin', label: 'Lin' },
        { value: 'morgan', label: 'Morgan', disabled: true },
      ]}
    />
  );
}
