import { Button, useMessage } from '@sudden3/leaf-ui';

function PublishAction() {
  const { message } = useMessage();
  return (
    <Button
      variant="outline"
      onClick={() =>
        message.open({ key: 'shared-publish', type: 'loading', content: '正在发布项目' })
      }
    >
      开始发布
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
          content: '项目已发布',
          duration: 3,
          closable: true,
        })
      }
    >
      在另一个组件更新结果
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
