import { Textarea } from '@sudden3/leaf-ui';

export function TextareaBasic() {
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">项目简介</span>
        <Textarea
          aria-label="项目简介"
          placeholder="描述一下你的新想法…"
          rows={3}
          maxLength={200}
        />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">只读介绍</span>
        <Textarea aria-label="只读介绍" defaultValue="把灵感，种进界面。" readOnly rows={2} />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">禁用介绍</span>
        <Textarea aria-label="禁用介绍" placeholder="暂时不可编辑" disabled rows={2} />
      </div>
    </div>
  );
}
