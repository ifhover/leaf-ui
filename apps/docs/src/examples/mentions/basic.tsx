import { Mentions } from '@ifhover/leaf-ui';

export function MentionsBasic() {
  return (
    <Mentions
      aria-label="评论"
      placeholder="输入 @ 提及团队成员"
      options={[
        { value: 'ada', label: 'Ada' },
        { value: 'lin', label: 'Lin' },
        { value: 'morgan', label: 'Morgan', disabled: true },
      ]}
    />
  );
}
