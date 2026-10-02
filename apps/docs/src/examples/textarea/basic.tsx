import { Textarea } from '@leaf-ui/react';

export function TextareaBasic() {
  return (
    <div className="leaf-demo-stack">
      <Textarea aria-label="项目简介" placeholder="描述一下你的新想法…" rows={3} maxLength={200} />
      <Textarea aria-label="只读介绍" defaultValue="把灵感，种进界面。" readOnly rows={2} />
      <Textarea aria-label="禁用介绍" placeholder="暂时不可编辑" disabled rows={2} />
    </div>
  );
}
