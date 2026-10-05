import { Breadcrumb } from '@sudden3/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Breadcrumb
      aria-label={english ? 'Collapsed project path' : '折叠后的项目路径'}
      maxItems={3}
      items={[
        { title: 'Home', href: '#home' },
        { title: 'Workspace', href: '#workspace' },
        { title: 'Projects', href: '#projects' },
        { title: 'Leaf UI', href: '#leaf' },
        { title: 'Tokens' },
      ]}
    />
  );
}
