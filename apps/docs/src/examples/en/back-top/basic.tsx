import { BackTop, Button } from '@ifhover/leaf-ui';

export function BackTopBasic() {
  return (
    <>
      <Button onClick={() => window.scrollBy(0, 600)}>Scroll down the page</Button>
      <BackTop />
    </>
  );
}
