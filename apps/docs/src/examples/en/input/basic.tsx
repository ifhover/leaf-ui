import { Input } from '@sudden3/leaf-ui';
import { Mail, Search } from 'lucide-react';

export function InputBasic() {
  return (
    <div className="leaf-demo-stack">
      <Input aria-label="Project name" placeholder="Name your project" />
      <Input aria-label="Search projects" prefix={<Search />} placeholder="Search projects" />
      <Input aria-label="Email" type="email" prefix={<Mail />} placeholder="hello@leaf.design" />
      <Input aria-label="Read-only project name" defaultValue="Leaf Garden" readOnly />
    </div>
  );
}
