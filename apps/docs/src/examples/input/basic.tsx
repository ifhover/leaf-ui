import { Input, Space } from '@ifhover/leaf-ui';
import { Mail, Search } from 'lucide-react';

export function InputBasic() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">项目名称</span>
        <Input aria-label="项目名称" placeholder="为你的项目起个名字" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">搜索项目</span>
        <Input aria-label="搜索项目" prefix={<Search />} placeholder="搜索项目" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">邮箱</span>
        <Input aria-label="邮箱" type="email" prefix={<Mail />} placeholder="hello@leaf.design" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">只读项目名称</span>
        <Input aria-label="只读项目名称" defaultValue="Leaf Garden" readOnly />
      </div>
    </Space>
  );
}
