import { BackTop, Button } from '@ifhover/leaf-ui';

export function BackTopBasic() {
  return (
    <>
      <Button onClick={() => window.scrollBy(0, 600)}>向下滚动页面</Button>
      <BackTop />
    </>
  );
}
