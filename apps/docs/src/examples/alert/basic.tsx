import { Alert } from '@sudden3/leaf-ui';
export function AlertBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Alert title="项目已保存" type="success" />
      <Alert title="有新的版本可用" description="你可以在方便的时候更新。" closable />
      <Alert title="请检查当前设置" type="warning" />
      <Alert title="保存失败" description="请稍后重试，或联系团队管理员。" type="error" />
    </div>
  );
}
