import { Mentions } from '@sudden3/leaf-ui';
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
export function MentionsPrefixes({ english = false }: { english?: boolean }) {
  return (
    <Mentions
      prefixes={['@', '#']}
      aria-label={english ? 'Project note' : '项目备注'}
      placeholder={english ? 'Use @ or # to insert a reference' : '使用 @ 或 # 插入引用'}
      options={[
        { value: 'design', label: english ? 'Design' : '设计' },
        { value: 'engineering', label: english ? 'Engineering' : '工程' },
      ]}
    />
  );
}
