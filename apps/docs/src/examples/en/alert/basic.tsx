import { Alert } from '@sudden3/leaf-ui';
export function AlertBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Alert title="Project saved" type="success" />
      <Alert
        title="A new version is available"
        description="Update whenever it is convenient."
        closable
      />
      <Alert title="Check your settings" type="warning" />
      <Alert
        title="Save failed"
        description="Try again later or contact your team administrator."
        type="error"
      />
    </div>
  );
}
