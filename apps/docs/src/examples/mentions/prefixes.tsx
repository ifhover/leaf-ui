import { Mentions } from '@ifhover/leaf-ui';
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
