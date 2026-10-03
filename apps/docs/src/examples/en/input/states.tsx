import { Input } from '@sudden3/leaf-ui';

export function InputStates() {
  return (
    <div className="leaf-demo-stack">
      <Input aria-label="Disabled input" disabled placeholder="Cannot edit right now" />
      <Input
        aria-label="Project name error"
        status="error"
        placeholder="Enter a project name"
        aria-describedby="project-error"
      />
      <span id="project-error" className="leaf-demo-error">
        Project name is required.
      </span>
      <Input aria-label="Name warning" status="warning" defaultValue="A similar name exists" />
    </div>
  );
}
