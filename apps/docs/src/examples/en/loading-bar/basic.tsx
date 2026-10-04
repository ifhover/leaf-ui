import { Button, useLoadingBar } from '@sudden3/leaf-ui';

export function LoadingBarBasic() {
  const bar = useLoadingBar();
  return (
    <Button
      onClick={() => {
        const done = bar.start();
        setTimeout(done, 1600);
      }}
    >
      Simulate page loading
    </Button>
  );
}
