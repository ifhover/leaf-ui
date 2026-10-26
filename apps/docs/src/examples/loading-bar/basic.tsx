import { Button, useLoadingBar } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function LoadingBarBasic() {
  const bar = useLoadingBar();
  const [pending, setPending] = useState(false);

  return (
    <Button
      loading={pending}
      onClick={async () => {
        const done = bar.start();
        setPending(true);
        try {
          await new Promise<void>((resolve) => setTimeout(resolve, 1600));
        } finally {
          done();
          setPending(false);
        }
      }}
    >
      模拟页面加载
    </Button>
  );
}
