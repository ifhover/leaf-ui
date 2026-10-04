import { Button, Result } from '@sudden3/leaf-ui';
export function ResultBasic() {
  return (
    <Result
      status="success"
      title="Project created"
      description="Everything is ready for your next great idea."
      extra={<Button>Open project</Button>}
    />
  );
}
