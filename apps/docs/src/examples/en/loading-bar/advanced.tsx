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
        40% progress
      </Button>
      <Button onClick={() => bar.finish()}>Finish</Button>
      <Button variant="soft" onClick={() => bar.reset()}>
        Reset
      </Button>
    </Space>
  );
}
