import { Button, Empty } from '@sudden3/leaf-ui';

export function EmptyBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Empty description="No projects yet">
        <Button>Create project</Button>
      </Empty>
      <Empty size="sm" />
      <Empty image={null} description="No search results" />
    </div>
  );
}
