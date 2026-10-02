import { Input } from '@leaf-ui/react';
import { Mail, Search } from 'lucide-react';

export function InputBasic() {
  return (
    <div className="leaf-demo-stack">
      <Input aria-label="项目名称" placeholder="为你的项目起个名字" />
      <Input aria-label="搜索项目" prefix={<Search />} placeholder="搜索项目" />
      <Input aria-label="邮箱" type="email" prefix={<Mail />} placeholder="hello@leaf.design" />
      <Input aria-label="只读项目名称" defaultValue="Leaf Garden" readOnly />
    </div>
  );
}
