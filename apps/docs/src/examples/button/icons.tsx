import { Button } from '@leaf-ui/react';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';

export function ButtonIcons() {
  return (
    <>
      <Button startIcon={<Plus />}>新建项目</Button>
      <Button variant="outline" endIcon={<ArrowRight />}>
        继续下一步
      </Button>
      <Button variant="soft" aria-label="添加项目" startIcon={<Plus />} />
      <Button danger variant="outline" aria-label="删除项目" startIcon={<Trash2 />} />
    </>
  );
}
