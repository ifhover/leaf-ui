import { Button, useMessage } from '@sudden3/leaf-ui';

function PublishAction() {
  const { message } = useMessage();
  return (
    <Button
      variant="outline"
      onClick={() =>
        message.open({ key: 'shared-publish', type: 'loading', content: 'Publishing the project' })
      }
    >
      Start publishing
    </Button>
  );
}

function PublishResult() {
  const { message } = useMessage();
  return (
    <Button
      onClick={() =>
        message.open({
          key: 'shared-publish',
          type: 'success',
          content: 'Project published',
          duration: 3,
          closable: true,
        })
      }
    >
      Update from another component
    </Button>
  );
}

export function MessageShared() {
  return (
    <div className="leaf-demo-row">
      <PublishAction />
      <PublishResult />
    </div>
  );
}
