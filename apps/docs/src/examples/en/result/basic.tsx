import { Button, Result, Space } from '@ifhover/leaf-ui';
export function ResultBasic() {
  return (
    <Result
      status="success"
      title="Project created"
      description="Everything is ready for your next great idea."
      extra={
        <Space>
          <Button variant="outline">Back to list</Button>
          <Button>Open project</Button>
        </Space>
      }
    />
  );
}
