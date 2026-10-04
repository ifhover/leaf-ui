import { Button, Result } from '@sudden3/leaf-ui';
export function ResultStates() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Result
        status="empty"
        size="sm"
        title="No projects yet"
        description="Create your first project to collect ideas."
        extra={<Button variant="outline">Create project</Button>}
      />
      <Result
        status="warning"
        size="sm"
        title="Storage is almost full"
        description="Remove unused content or adjust your storage limit."
      />
      <Result
        status="error"
        size="sm"
        title="Publishing failed"
        description="Check your connection and try again."
        extra={<Button variant="outline">Retry</Button>}
      />
      <Result
        status="info"
        size="sm"
        title="Review in progress"
        description="The project page will update when it is complete."
      />
    </div>
  );
}
