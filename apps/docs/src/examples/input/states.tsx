import { Input } from '@sudden3/leaf-ui';

export function InputStates() {
  return (
    <div className="leaf-demo-stack">
      <Input aria-label="禁用输入" disabled placeholder="暂时不可编辑" />
      <Input
        aria-label="项目名称错误"
        status="error"
        placeholder="请输入项目名称"
        aria-describedby="project-error"
      />
      <span id="project-error" className="leaf-demo-error">
        项目名称不能为空。
      </span>
      <Input aria-label="名称警告" status="warning" defaultValue="已经存在相似名称" />
    </div>
  );
}
