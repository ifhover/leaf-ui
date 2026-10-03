import { Button, Empty } from '@sudden3/leaf-ui';

export function EmptyBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Empty description="还没有项目">
        <Button>创建项目</Button>
      </Empty>
      <Empty size="sm" />
      <Empty image={null} description="暂时没有搜索结果" />
    </div>
  );
}
