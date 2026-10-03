import { Button } from '@sudden3/leaf-ui';

export function ButtonStates() {
  return (
    <>
      <Button disabled>Unavailable</Button>
      <Button loading>Loading</Button>
      <Button variant="outline" disabled>
        Disabled
      </Button>
    </>
  );
}
