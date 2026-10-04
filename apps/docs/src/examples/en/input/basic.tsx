import { Input } from '@sudden3/leaf-ui';
import { Mail, Search } from 'lucide-react';

export function InputBasic() {
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Project name</span>
        <Input aria-label="Project name" placeholder="Name your project" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Search projects</span>
        <Input aria-label="Search projects" prefix={<Search />} placeholder="Search projects" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Email</span>
        <Input aria-label="Email" type="email" prefix={<Mail />} placeholder="hello@leaf.design" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Read-only project name</span>
        <Input aria-label="Read-only project name" defaultValue="Leaf Garden" readOnly />
      </div>
    </div>
  );
}
