import { Collapse } from '@ifhover/leaf-ui';

export function CollapseAccordion() {
  return (
    <Collapse
      accordion
      defaultActiveKey="about"
      items={[
        {
          key: 'about',
          label: 'About the project',
          children: 'Project information and collaboration notes.',
        },
        {
          key: 'updates',
          label: 'Updates',
          children: 'Review recent feature and content updates.',
        },
        { key: 'archived', label: 'Archived', children: null, disabled: true },
      ]}
    />
  );
}
