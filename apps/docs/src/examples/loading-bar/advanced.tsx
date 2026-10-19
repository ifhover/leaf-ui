import { Button, Space, useLoadingBar } from '@ifhover/leaf-ui';

export function LoadingBarProgress() {
  const bar = useLoadingBar();
  return (
    <Space>
      <Button
        variant="outline"
        onClick={() => {
          bar.reset();
          bar.start();
          bar.set(40);
        }}
      >
        进度 40%
      </Button>
      <Button onClick={() => bar.finish()}>完成</Button>
      <Button variant="soft" onClick={() => bar.reset()}>
        重置
      </Button>
    </Space>
  );
}
